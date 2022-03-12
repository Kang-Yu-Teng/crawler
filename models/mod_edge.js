import md5 from "md5";
import { attribute, Digraph, Subgraph, Node, Edge, toDot }  from "ts-graphviz";

const edgeModel = {
    create: (from_node,to_node,edge_name,edge_from_link,edge_to_link) => {
        var dict = new Object();
        dict["name"] = edge_name;
        dict["from_link"] = edge_from_link;
        dict["to_link"] = edge_to_link;
        dict["id"] = md5(edge_from_link + edge_to_link);
        dict["obj"] = new Edge([from_node, to_node], {
            [attribute.label]: dict["name"]
        });
        return dict;
    }
}
  
export default edgeModel