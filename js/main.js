window.onload = loaded;

//Using the same endpoint so make available globally
const apiRoute = "https://reeiitr1qg.execute-api.us-east-2.amazonaws.com/items";

//adding table globally to make it easier to update....not ideal
const tableBody = document.querySelector("#data-table tbody");

/**
 * Simple Function that will be run when the browser is finished loading.
 * This sets our event listeners for submitted items, and table loading.
 * It prevents them from running by default, then calls the appropriate functions
 * for additonal handling.
 */
function loaded() {
    document.getElementById("item-submission").addEventListener('submit', function(e){
        e.preventDefault();
        submitData();
        loadTable();
        e.target.reset();
    });
    document.getElementById("load-data").addEventListener('click', function(e){
        e.preventDefault();
        loadTable(); 
    });
}


/**
 * This function loads the data table with the provided xhr request.
 * There is some added functionality to loop through the xhr response,
 * getting each data value of the json object returned, and dynamically adding
 * that value to an html table. For each object a row is created.
 * In each row, a delete button is added referencing the unique id of the item 
 * referenced by the json object.
 * 
 * This is used for the delete function.
 */
export function loadTable(){
    console.log("loading table");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", apiRoute);
    xhr.responseType ='json'
    xhr.addEventListener("load", function () {
    
        if (xhr.status === 200) {
            tableBody.innerHTML = ''; //clears table to reload data
        }

        //loop through response, adding a row for each object, and a column for each
        //objects data including a delete button storing the item id as it's value
        xhr.response.forEach(item => {
            console.log(xhr.response);
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td><button class="delete-button" value=${item.id}>Delete</button></td>
            `;
            
            //add the data to the table
            tableBody.appendChild(row);
        });
        //adds event listerners for each button
        deleteButtonSetup();
    });
    xhr.send();
};

/**
 * This function simply adds event listeners to each delete button created when the table is loaded.
 * It adds an onclick event to listen for a button press.
 * If the button is pressed, it's value is passed to delete row, a Delete Request is made, and the row
 * is removed.
 */
export function deleteButtonSetup(){
    //grab all delete buttons
    const deleteButtons = document.querySelectorAll(".delete-button");
    //loop through each button, add a click event listener, and on click, call deleterow
    deleteButtons.forEach(function(button){
        button.addEventListener('click', function() {
            deleteRow(button.value, button); // Call deleteRow and pass button value
        });
    });
};


/**
 * This function simply deletes the item from the database.
 * @param {} deleteId - the item to be deleted
 */

export function deleteRow(deleteId, button){
                
    let xhr = new XMLHttpRequest();
    xhr.open("DELETE", `${apiRoute}/${deleteId}`);
    xhr.setRequestHeader("Content-Type", "application/json");
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            let row = button.closest('tr');
            row.innerHTML = '';  
            console.log("successfully deleted: " + deleteId);   
        }
    };
    
    xhr.send();
}

/**
 * This function submits user provided data.
 * It creates a payload based on the user input to the page form.
 * That payload is sent in an XML request to put the data into our database
 * It then returns, and after load table is called to show the new data.
 */
export function submitData(){
   
    //get data from form
    let payload ={
        id: document.getElementById('item-id').value,
        name: document.getElementById('item-name').value,
        price: document.getElementById('item-price').value
    }

    console.log(payload)

    let xhr = new XMLHttpRequest();
    xhr.open("PUT", apiRoute);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify(payload));
    console.log("Successfully added: " + payload.id + "," + payload.name + "," + payload.price)
}

