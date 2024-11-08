window.onload = loaded;

//Using the same endpoint so make available globally
const apiRoute = "https://reeiitr1qg.execute-api.us-east-2.amazonaws.com/items";

//adding body of the table globally to make it easier to update
const tableBody = document.querySelector("#data-table tbody");

/**
 * Simple Function that will be run when the browser is finished loading.
 * This sets our event listeners for submitted items, and table loading.
 * It prevents them from running by default, then calls the appropriate functions
 * for additonal handling.
 */
function loaded() {
    document.getElementById("item-submission").addEventListener('submit', function(e) {
        e.preventDefault();
        submitData();
        e.target.reset();
    });
    document.getElementById("load-data").addEventListener('click', function(e) {
        e.preventDefault();
        loadTable(); 
    });
}


/**
 * This function loads the data table with the provided XML request.
 * There is some added functionality to loop through the XML response,
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

        //check for good response: note error handling for a bad response would be ideal
        if (xhr.status === 200) {
            tableBody.innerHTML = ''; //clears table to reload data
        }

        //loop through response, adding a row for each object, and a column for each
        //objects data including a delete button storing the item id as it's value
        xhr.response.forEach(item => {
            console.log(xhr.response);
            const row = document.createElement('tr'); //create a table row element
            
            //set the innerHTML of the row element using the data in the xml response json object
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td><button class="delete-button" value=${item.id}>Delete</button></td> 
            `;
            
            //add the data to the table
            tableBody.appendChild(row);
        });
        //add placeholder row
        const row = document.createElement('tr'); //create a table row element
        row.innerHTML = `
                <td>...</td>
                <td>...</td>
                <td>...</td>
                <td><button class="delete-button" disabled>Delete</button></td> 
            `;
        tableBody.appendChild(row);

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
    //grab all delete buttons within the page
    const deleteButtons = document.querySelectorAll(".delete-button");
    //loop through each button, add a click event listener, and on click, call deleteRow
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
    
    //if a good response is recieved, grab the row that was associated with the button
    // and clear the html of that row to reflect the updated data table
    xhr.onload = function() {
        if (xhr.status === 200) {
            let row = button.closest('tr');
            row.innerHTML = '';
            //out put deleted item to the console for developers/debugging  
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
   
    //get data from form and ready for put request
    let payload ={
        id: document.getElementById('item-id').value,
        name: document.getElementById('item-name').value,
        price: document.getElementById('item-price').value
    }

    //create the request and send the payload in json form
    let xhr = new XMLHttpRequest();
    xhr.open("PUT", apiRoute);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = function() {
        if (xhr.status === 200) {
            //output added item to the console for developers/debugging  
            console.log("Successfully added: " + payload.id + "," + payload.name + "," + payload.price);
            loadTable();  
        }
    };
    xhr.send(JSON.stringify(payload));
    //output the successfully added items to the console for developers/debugging
}

