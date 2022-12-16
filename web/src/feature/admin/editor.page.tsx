import { FC, useState } from "react"
import { Layout } from "antd"
import { Resizable } from "re-resizable";
import { useDispatch, useSelector } from "react-redux";

import { CodeEditComponent, CodeEditProps, EditorSidebarComponent, TeamCreateModal, TEAM_SIDEBAR_MENU } from "../../component/code-editor"
import { selectActiveFlow, selectFlows, selectTeams, setActiveFlow } from "./adminSlice";
import { useCreateTeamMutation, useGetFlowsQuery, useGetTeamsQuery, useUpdateFlowMutation } from "../../service";
import './editor.page.scss';
import { useContextMenu } from "react-contexify";
import { Team } from "../../model";

const { Sider } = Layout;

const EditorPage: FC = () => {
    const disptach = useDispatch();
    useGetTeamsQuery({});
    useGetFlowsQuery();
    const activeFlow = useSelector(selectActiveFlow);
    const teams = useSelector(selectTeams);

    const [teamCreateModalVisible, setTeamCreateModalVisible] = useState<boolean>(false);
    const [createTeam] = useCreateTeamMutation();
    const { show: showTeamContextMenu } = useContextMenu({
        id: TEAM_SIDEBAR_MENU
    });

    const flows = useSelector(selectFlows);
    const [updateFlow, { isLoading }] = useUpdateFlowMutation();
    const [sidebarWidth, setSidebarWidth] = useState<number>(0);
    const props: CodeEditProps = {
        code: JSON.stringify(activeFlow || {}, undefined, 2),
        onSaveFlow: (flow) => {
            updateFlow({ flow });
        },
        sidebarWidth,
        isLoading,
        activeFlow,
        setActiveFlow: (flow) => disptach(setActiveFlow(flow))
    }

    const onTeamCreateModal = (team: Team) => {
        createTeam(team);
        setTeamCreateModalVisible(false);
    }
    return <Layout className="edit-page-root">
        <Resizable
            defaultSize={{
                width: '15vw',
                height: '100%',
            }}
            minWidth='10vw'
            maxWidth='20vw'
            onResize={e => {
                setSidebarWidth((e.target as HTMLElement).clientWidth);
            }}
            onResizeStop={(_e, _direction, ele) => {
                setSidebarWidth(ele.clientWidth);
            }}
            enable={{
                right: true
            }}>
            <Sider width={'100%'} className="edit-page-sidebar" onContextMenu={e => {
                showTeamContextMenu({
                    event: e,
                    props: { source: 'workspace' }
                });
                e.stopPropagation();
            }}>
                {(teams && flows) && <EditorSidebarComponent teams={teams} flows={flows} activeFlow={activeFlow} />}

            </Sider>
        </Resizable>


        <Layout className="editor-page-content">
            <CodeEditComponent {...props} />
        </Layout>

        <TeamCreateModal activeTeam={null} isModalOpen={teamCreateModalVisible} handleOk={onTeamCreateModal} toggleVisible={() => setTeamCreateModalVisible(!teamCreateModalVisible)} />
        <div className="status-bar">
        </div>
    </Layout>
}

export default EditorPage;