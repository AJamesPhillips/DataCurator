
import { useMemo } from "preact/hooks"
import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import { KnowledgeViewList } from "./KnowledgeViewList"
import type { KnowledgeViewListCoreProps } from "./interfaces"



interface OwnProps extends KnowledgeViewListCoreProps { }


export function KnowledgeViewListsSet (props: OwnProps)
{
    const { priority, normal, hidden, archived, errored } = useMemo(() =>
    {
        const priority: KnowledgeView[] = []
        const normal: KnowledgeView[] = []
        const hidden: KnowledgeView[] = []
        const archived: KnowledgeView[] = []
        const errored: KnowledgeView[] = []

        props.knowledge_views.forEach(kv =>
        {
            const entry = props.nested_knowledge_view_ids.map[kv.id]

            if (entry?.sort_type === "errored") errored.push(kv)
            else if (kv.sort_type === "hidden") hidden.push(kv)
            else if (kv.sort_type === "archived") archived.push(kv)
            else if (kv.sort_type === "priority") priority.push(kv)
            else normal.push(kv)
        })

        return { priority, normal, hidden, archived, errored }
    }, [props.knowledge_views])


    return <div>
        <br />
        <KnowledgeViewList
            {...props}
            knowledge_views={priority}
            sort_type="priority"
        />
        <br />
        <KnowledgeViewList
            {...props}
            knowledge_views={normal}
            sort_type="normal"
        />
        <br />
        <KnowledgeViewList
            {...props}
            knowledge_views={hidden}
            sort_type="hidden"
        />
        <br />
        <KnowledgeViewList
            {...props}
            knowledge_views={archived}
            sort_type="archived"
        />

        <br />
        <KnowledgeViewList
            {...props}
            knowledge_views={errored}
            sort_type="errored"
        />
    </div>
}
