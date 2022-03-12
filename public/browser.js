//import app from "./app.js";

document.addEventListener('click', function (e) {
    //console.log("You click the button");
    if (e.target.classList.contains("edit-me")) {
        let userInput = prompt("請修改任務網址")
        //console.log(userInput)
        let _id = e.target.getAttribute("data-id");
        //console.log(_id);
        
        if(userInput == null){
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/update-item", false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            mission: userInput,
            id: _id
        }));
        document.location.reload()
    }
    if (e.target.classList.contains("delete-me")) {
        //console.log(userInput)
        let _id = e.target.getAttribute("data-id");
        //console.log(_id);
        
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/delete-item", false);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({
            id: _id
        }));
        document.location.reload()
    }
})