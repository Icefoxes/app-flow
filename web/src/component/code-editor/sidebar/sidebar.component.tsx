import { FC, useState } from "react"
import { useContextMenu } from "react-contexify";
import { message, Modal, Tree } from 'antd';
import type { DataNode, TreeProps } from 'antd/es/tree';
import { useNavigate } from "react-router-dom";
import { FcFolder, FcBriefcase, FcBarChart } from 'react-icons/fc';
import {
    ExclamationCircleOutlined,
} from '@ant-design/icons';

import './sidebar.component.scss';

import { FlowContextMenu, FlowContextMenuType, FLOW_SIDEBAR_MENU } from "./sidebar.flow.context-menu";
import { TeamContextMenu, TeamContextMenuType, TEAM_SIDEBAR_MENU } from "./sidebar.team.context-menu";
import { TeamCreateModal } from "./team.create.modal";

import { useCreateFlowMutation, useCreateTeamMutation, useDeleteFlowMutation, useDeleteTeamMutation, useUpdateTeamMutation, useLazyGetFlowByIdQuery } from "../../../service";

import { FlowLight, Team } from "../../../model";
import utils from "../../shared/util";


// --team
//     -- tag
//         -- flow
interface EditorSidebarProps {
    teams: Team[];
    flows: FlowLight[];
}


export const EditorSidebarComponent: FC<EditorSidebarProps> = ({ teams, flows }) => {
    // hooks
    const navigation = useNavigate();
    // data

    const [createTeam] = useCreateTeamMutation();
    const [updateTeam] = useUpdateTeamMutation();
    const [deleteTeam] = useDeleteTeamMutation();
    const [createFlow] = useCreateFlowMutation();
    const [deleteFlow] = useDeleteFlowMutation();

    const [getFlowById] = useLazyGetFlowByIdQuery();
    // menu
    const { show: showFlowContextMenu } = useContextMenu({
        id: FLOW_SIDEBAR_MENU
    });

    const { show: showTeamContextMenu } = useContextMenu({
        id: TEAM_SIDEBAR_MENU
    });

    // state
    const [teamCreateModalVisible, setTeamCreateModalVisible] = useState<boolean>(false);
    const [activeTeam, setActiveTeam] = useState<Team | null>(null);
    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        // TODO
        console.log('selected', selectedKeys, info);
    };

    const onFlowContextMenu = (item: FlowContextMenuType, props?: any) => {
        if (item === FlowContextMenuType.Edit) {
            const flow = props as FlowLight;
            getFlowById({ id: flow.id }); // ==> setActiveFlow ==> Show on Editor
            return;
        } else if (item === FlowContextMenuType.Open) {
            const flow = props as FlowLight;
            navigation(`teams/${flow.team}/flows/${flow.id}`);
        } else if (item === FlowContextMenuType.Delete) {
            const flow = props as FlowLight;
            deleteFlow({ flow })
            message.success(`deleted ${flow.name}`)
        }
    }

    const onTeamContextMenu = (item: TeamContextMenuType, props?: any) => {
        if (item === TeamContextMenuType.AddTeam) {
            setActiveTeam(null);
            setTeamCreateModalVisible(true);
            return;
        }
        else if (item === TeamContextMenuType.AddFlow) {
            const { id } = props;
            createFlow({ flow: utils.newFlow(id) });
        }
        else if (item === TeamContextMenuType.DeleteTeam) {
            const team = props as Team;
            Modal.confirm({
                title: 'Confirm',
                icon: <ExclamationCircleOutlined />,
                content: 'Do you want to delete this team',
                okText: 'Confirm',
                cancelText: 'Cancel',
                onOk: () => deleteTeam(team)
            });
        }
        else if (item === TeamContextMenuType.EditTeam) {
            const team = props as Team;
            setActiveTeam(team);
            setTeamCreateModalVisible(true);
        }
    }

    const onTeamCreateModal = (team: Team) => {
        if (team._id) {
            updateTeam(team);
        } else {
            createTeam(team);
        }
        setTeamCreateModalVisible(false);
    }

    const generateTreeData = () => {
        return teams.map(team => {
            const tags = Array.from(new Set(flows.filter(flow => flow.tag && flow.team === team.id).map(flow => flow.tag)));
            return {
                title: () => <div className="gnomon-tree-node" onContextMenu={e => {
                    showTeamContextMenu({
                        event: e,
                        props: { source: 'tree', ...team }
                    })
                }}>
                    <FcFolder className="prefix" />   {team.name}
                </div>,
                key: `${team.id}`,
                isLeaf: false,
                children: [...flows.filter(flow => !!!flow.tag && flow.team === team.id).map(flow => {
                    return {
                        title: () => <div className="gnomon-tree-node" onContextMenu={e => {
                            showFlowContextMenu({
                                event: e,
                                props: flow
                            });
                        }}>
                            <FcBarChart className="prefix" /> {flow.name}
                        </div>,
                        key: `${flow.id}`,
                        isLeaf: true
                    } as DataNode
                }), ...tags.sort().map(tag => {
                    return {
                        title: () => <div className="gnomon-tree-node">
                            <FcBriefcase className="prefix" /> {tag}
                        </div>,
                        key: `${tag}`,
                        isLeaf: false,
                        children: [...flows.filter(flow => flow.tag === tag).map(flow => {
                            return {
                                title: () => <div className="gnomon-tree-node" onContextMenu={e => {
                                    showFlowContextMenu({
                                        event: e,
                                        props: flow
                                    });
                                }}>
                                    <FcBarChart className="prefix" /> {flow.name}
                                </div>,
                                key: `${flow.id}`,
                                isLeaf: true
                            } as DataNode
                        })]
                    } as DataNode
                })]
            } as DataNode
        });
    }

    return <>
        <Tree
            className="gnomon-tree"
            style={{ width: '100%', height: '100%', padding: '10px' }}
            onSelect={onSelect}
            treeData={generateTreeData()}
        />
        <FlowContextMenu onItemClick={onFlowContextMenu} />
        <TeamContextMenu onItemClick={onTeamContextMenu} />
        <TeamCreateModal
            activeTeam={activeTeam as Team}
            handleOk={onTeamCreateModal}
            isModalOpen={teamCreateModalVisible}
            toggleVisible={() => setTeamCreateModalVisible(!teamCreateModalVisible)} />
    </>
}