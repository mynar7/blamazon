const inq = require("inquirer");
const mysql = require("mysql");
const colors = require("colors");
const db = require("./db.js");
const storeDB = new db();

//get credentials
let con = mysql.createConnection(storeDB.credentials());
//connect to the db
con.connect(function(err){
    if (err) throw err;
    console.log("Connected as: " + con.threadId);
    storeDB.listProducts(con, buyPrompt, "Buy Something?");
});



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
            validate: storeDB.onlyNumbers
        }
    ]).then(function(ans){
        let index = items.indexOf(ans.choice);
        let id = arr[index].item_id;
        checkStock(arr, ans.choice, id, ans.quantity, purchaseItem);
    });
}

function checkStock(arr, name, id, int, buyFx) {
    con.query("SELECT stock_quantity FROM products WHERE item_id = ?", [id], function(err, res) {
        if(err) throw err;
        let currentStock = res[0].stock_quantity;
        if(currentStock < int) {
            console.log("\nNot enough stock!\n".red);
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
        storeDB.listProducts(con, (res) => {
            console.log("\nSuccessfully purchased (" + quantity.green + ") " + name.yellow + "!\n");
            buyPrompt(res, "Buy something else?")
        });
    });
}

function buyPrompt(res, msg) {
    inq.prompt([
        {
            type: 'list',
            message: msg,
            choices: ["Yes", "No"],
            name: 'choice'
        }
    ]).then(function(ans){
        if(ans.choice == 'Yes') {
            buySomething(res);
        } else {
            con.end();
            return console.log("\nThank you for your business!\n".rainbow);
        }
    });
}