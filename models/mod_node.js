import { concat } from "async";
import md5 from "md5";
import { attribute, Digraph, Subgraph, Node, Edge, toDot }  from "ts-graphviz";
import he from "he";
//const {he} = pkg;

const nodeModel = {
    create: (node_name,node_link,md5_arg="") => {
        var dict = new Object();
        dict["name"] = node_name;
        dict["link"] = node_link;
        dict["id"] = md5(node_link+md5_arg);
        //var node_label = concat(`<<table border="0" cellspacing="10" cellpadding="10" style="rounded"><tr><td href="`,node_link,`" border="0" cellspacing="10" cellpadding="10" style="rounded">`,node_name,`</td></tr></table>>`);
        dict["obj"] = new Node(dict["id"], {
            [attribute.color]: 'red',
            [attribute.label]: `<<table border="0" cellspacing="10" cellpadding="10" style="rounded"><tr><td href="` +  he.encode(node_link) + `" border="0" cellspacing="10" cellpadding="10" style="rounded">`+ he.encode(node_name) +`</td></tr></table>>`
        });
        //console.log(node_link);
        //console.log(dict["obj"]);
        return dict;
    }
}
  
export default nodeModel