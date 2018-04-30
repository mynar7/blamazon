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
        let item = arr[index];
        checkStock(arr, item, ans.quantity, purchaseItem);
    });
}

function checkStock(itemArr, itemObj, quantity, purchaseFx) {
    con.query("SELECT stock_quantity FROM products WHERE item_id = ?", [itemObj.item_id], function(err, res) {
        if(err) throw err;
        let currentStock = res[0].stock_quantity;
        if(currentStock < quantity) {
            console.log("\nNot enough stock!\n".red);
            buySomething(itemArr);
        } else {
            purchaseFx(itemObj, quantity, updateDeptSales);
        }
    });
}

function updateDeptSales(itemObj, amt) {
    con.query("SELECT product_sales FROM departments WHERE department_name = ?", 
    [itemObj.department_name], 
    function(err, res) {
        if(err) throw err;
        let currentSales = parseFloat(res[0].product_sales);
        let newSales = currentSales + (parseFloat(itemObj.price) * amt);
        con.query("UPDATE departments SET ? WHERE ?",[
            {
                product_sales: newSales
            },
            {
                department_name: itemObj.department_name
            }
        ],
        function(err,res) {
            if(err) throw err;
            console.log("\nSuccessfully purchased (" + amt.green + ") " + colors.yellow(itemObj.product_name) + "!\n");
            storeDB.listProducts(con, buyPrompt, "Buy Something Else?"); 
        });//update query
    });//select query
}

function purchaseItem(itemObj, quantity, updateSalesFx) {
    con.query("UPDATE products SET ? WHERE ?",[
        {
            stock_quantity: itemObj.stock_quantity - quantity
        },
        {
            item_id: itemObj.item_id
        }
    ], function(err, res){
        if(err) throw err;
        updateSalesFx(itemObj, quantity);
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