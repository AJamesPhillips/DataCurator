import { h } from "preact"

import type { KnowledgeView } from "../shared/interfaces/knowledge_view"
import { KnowledgeViewList } from "./KnowledgeViewList"
import type { KnowledgeViewListCoreProps } from "./interfaces"
import { useMemo } from "preact/hooks"



interface OwnProps extends KnowledgeViewListCoreProps { }


export function KnowledgeViewListsSet (props: OwnProps)
{
    const { priority, normal, hidden, archived } = useMemo(() =>
    {
        const priority: KnowledgeView[] = []
        const normal: KnowledgeView[] = []
        const hidden: KnowledgeView[] = []
        const archived: KnowledgeView[] = []

        props.knowledge_views.forEach(kv =>
        {
            if (kv.sort_type === "hidden") hidden.push(kv)
            else if (kv.sort_type === "archived") archived.push(kv)
            else if (kv.sort_type === "priority") priority.push(kv)
            else normal.push(kv)
        })

        return { priority, normal, hidden, archived }
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
    </div>
}
