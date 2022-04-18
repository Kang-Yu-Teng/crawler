var url_test = [
    "https://demo.bookstackapp.com/shelves",
    "https://demo.bookstackapp.com/shelves/demo-content",
    "https://demo.bookstackapp.com/books/bookstack-demo-site",
    "https://demo.bookstackapp.com/books/bookstack-demo-site/chapter/content-examples",
    "https://demo.bookstackapp.com/books/bookstack-demo-site/page/mixed-content-example-page"
    ]

var patterns = [];
const shelves_pattern = ".*\/shelves$";
const shelf_pattern = ".*\/shelves\/.*";
const book_pattern = ".*\/books\/(?!.*\/)";
const chapter_pattern = ".*\/books\/.*\/chapter\/.*";
const page_pattern = ".*\/books\/.*\/page\/.*";
const wikipedia_pattern = "zh\.wikipedia\..*";
const normal_pattern = "^((?![\.]).)*$";
const link_pattern = ".*\/link\/.*#bkmrk-.*";
patterns.push(shelves_pattern);
patterns.push(shelf_pattern);
patterns.push(book_pattern);
patterns.push(chapter_pattern);
patterns.push(page_pattern);
patterns.push(wikipedia_pattern);
patterns.push(normal_pattern);
patterns.push(link_pattern);

var type_dict = {};
type_dict[RegExp(shelves_pattern)]="bookstack_shelves_pattern";
type_dict[RegExp(shelf_pattern)]="bookstack_shelf_pattern";
type_dict[RegExp(book_pattern)]="bookstack_book_pattern";
type_dict[RegExp(chapter_pattern)]="bookstack_chapter_pattern";
type_dict[RegExp(page_pattern)]="bookstack_page_pattern";
type_dict[RegExp(wikipedia_pattern)]="wikipedia_pattern";
type_dict[RegExp(normal_pattern)]="normal_pattern";
type_dict[RegExp(link_pattern)]="bookstack_link_pattern";

var pattern_dict = {};
pattern_dict["bookstack_shelves_pattern"]=RegExp(shelves_pattern);
pattern_dict["bookstack_shelf_pattern"]=RegExp(shelf_pattern);
pattern_dict["bookstack_book_pattern"]=RegExp(book_pattern);
pattern_dict["bookstack_chapter_pattern"]=RegExp(chapter_pattern);
pattern_dict["bookstack_page_pattern"]=RegExp(page_pattern);
pattern_dict["wikipedia_pattern"]=RegExp(wikipedia_pattern);
pattern_dict["normal_pattern"]=RegExp(normal_pattern);
pattern_dict["bookstack_link_pattern"]=RegExp(link_pattern);

/*
url_test.forEach(
    function(target){
    console.log(target);
    patterns.forEach(
        function(rule){
        regex = new RegExp(rule);
        console.log(regex.test(target));
        }
    );
    }
);
*/

const crawlerRuleModel = {
    getAllType: () => {
        return type_dict
    },

    get: (target) => {
        var type_result = "";
        patterns.forEach(
            function(rule){
                var regex = new RegExp(rule);
                var bool_result = regex.test(target);
                //console.log(regex.test(target));
                if(bool_result==true){
                    type_result =  type_dict[regex];
                    //console.log(type_result);
                }
            }
        );
        return type_result
    },
    create: (solverType,nodeBanlist = {},edgeBanlist={}) => {
        var rule = new Object();
        rule.solverType = solverType;
        rule.nodeBanlist = nodeBanlist;
        rule.edgeBanlist = edgeBanlist;
        return rule;
    }
}
  
export default crawlerRuleModel