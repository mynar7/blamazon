const inq = require("inquirer");
const mysql = require("mysql");
const colors = require("colors");
const storeDB = require("./db.js");
const {table} = require('table');

//get credentials
let con = mysql.createConnection(storeDB);

//connect to the db
con.connect(function(err){
    if (err) throw err;
    console.log("Connected as: " + con.threadId);
    listProducts(buySomething);
})

//query for available products, then display them, then prompt to buy something
function listProducts(callback) {
    con.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        displayProducts(res);
        if(callback) {
            callback(res);
        }
    })//end query
}//end function

//uses table and colors npm to display data in nice format
function displayProducts(arr) {
    let data = [];
    let headerRow = ["Product ID".cyan, "Name".cyan, "Price".cyan, "Quantity".cyan, "Department".cyan];
    data.push(headerRow);
    for(let i = 0; i < arr.length; i++) {
        let row = [
            arr[i].item_id,
            arr[i].product_name .yellow,
            arr[i].price,
            arr[i].stock_quantity,
            arr[i].department_name
        ];
        data.push(row);
    }
    let output = table(data);
    console.log(output);
}

//prompt for things to buy
function buySomething(arr) {
    let items = [];
    for(let i = 0; i < arr.length; i++) {
        items.push(arr[i].product_name);
    }
    inq.prompt([
        {
            type: 'list',
            message: 'What would you like to buy',
            name: 'choice',
            choices: items
        },
        {
            type: 'input',
            message: 'How many would you like?',
            name: 'quantity',
            validate: onlyNumbers
        }
    ]).then(function(ans){
        let index = items.indexOf(ans.choice);
        let id = arr[index].item_id;
        checkStock(arr, ans.choice, id, ans.quantity, purchaseItem);
    });
}

//validate function to ensure a string only contains numbers
function onlyNumbers(str) {
    if(str.length == 0) return false;
    for(let i = 0; i < str.length; i++) {
        if(str.charCodeAt(i) < 48 || str.charCodeAt(i) > 57) {
            return false;
        }
    } //end for loop
    return true;
}

function checkStock(arr, name, id, int, buyFx) {
    con.query("SELECT stock_quantity FROM products WHERE item_id = ?", [id], function(err, res) {
        if(err) throw err;
        let currentStock = res[0].stock_quantity;
        if(currentStock < int) {
            console.log("Not enough stock!");
            buySomething(arr);
        } else {
            buyFx(name, id, int, currentStock);
        }
    });
}

function purchaseItem(name, id, quantity, currentStock) {
    con.query("UPDATE products SET ? WHERE ?",[
        {
            stock_quantity: currentStock - quantity
        },
        {
            item_id: id
        }
    ], function(err, res){
        if(err) throw err;
        listProducts((res) => {
            console.log("Successfully purchased (" + quantity.green + ") " + name.yellow + "!");
            inq.prompt([
                {
                    type: 'list',
                    message: "Buy something else?",
                    choices: ["Yes", "No"],
                    name: 'choice'
                }
            ]).then(function(ans){
                if(ans.choice == 'Yes') {
                    buySomething(res);
                } else {
                    con.end();
                    return console.log("Thank you for your business!".rainbow);
                }
            })
        });
    });
}