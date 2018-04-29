const inq = require("inquirer");
const mysql = require("mysql");
const colors = require("colors");
const db = require("./db.js");
const storeDB = new db();

//get credentials
let con = mysql.createConnection(storeDB.credentials());

const menuOp = {
    type: 'list',
    message: 'Welcome to Blamazon Management View',
    name: 'choice',
    choices: [
        'View Products for Sale', 
        'View Low Inventory', 
        'Add to Inventory', 
        'Add New Product', 
        'Remove Item from Inventory',
        'Exit'
    ]
}

function mainMenu() {
    inq.prompt(menuOp).then(function(ans){
        switch(ans.choice) {
            case 'View Products for Sale':
                storeDB.listProducts(con, mainMenu);
                break;
            case 'View Low Inventory':
                storeDB.listLowProducts(con, mainMenu);
                break;
            case 'Add to Inventory':
                addStockPrompt();
                break;
            case 'Add New Product':
                newProduct();
                break;
            case 'Remove Item from Inventory':
                removeProduct();
                break;
            default:
                con.end();
                return console.log("\nHave a nice day!\n".rainbow);
                break;
        }
    });
}

function addStockPrompt() {
    inq.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'Add inventory to:',
            choices: ['All Products', 'Low Inventory Only']
        }
    ]).then(function(ans){
        switch(ans.choice) {
            case 'All Products':
                storeDB.listProducts(con, addStock);
                break;
            case 'Low Inventory Only':
                storeDB.listLowProducts(con, addStock);
                break;
        }
    }); 
}

function addStock(res) {
    let items = [];
    for(let i = 0; i < res.length; i++) {
        items.push(res[i].product_name);
    }
    inq.prompt([
        {
            type: 'list',
            message: 'Add Stock to which item?',
            name: 'choice',
            choices: items
        },
        {
            type: 'input',
            message: 'Enter Order Amount:',
            name: 'quantity',
            validate: storeDB.onlyNumbers
        }
    ]).then(function(ans){
        let index = items.indexOf(ans.choice);
        let id = res[index].item_id;
        let currentAmt = parseInt(res[index].stock_quantity);
        updateStock(ans.choice, id, currentAmt, parseInt(ans.quantity));
    });
}

function updateStock(name, id, oldAmt, addAmt) {
    let amt = oldAmt + addAmt;
    con.query("UPDATE products SET ? WHERE ?", [
    {
        stock_quantity: amt
    },
    {
        item_id: id
    }
    ], function(err, res) {
        if (err) throw err;
        console.log('\n' + name.yellow + colors.green('(' + addAmt + ')') + ' added to stock!\n');
        mainMenu();
    });
}

function newProduct() {
    inq.prompt([
        {
            type: 'list',
            message: 'Add a new product to catalog?',
            choices: ['Yes', 'No'],
            name: 'choice'
        }
    ]).then(function(ans) {
        if(ans.choice == 'No') {
            return mainMenu();
        }
        inq.prompt([
            {
                type: 'input',
                message: 'Enter Item Name:',
                name: 'itemName',
                validate: nonEmptyString
            },
            {
                type: 'input',
                message: 'Enter Department Name:',
                name: 'deptName',
                validate: nonEmptyString
            },
            {
                type: 'input',
                message: 'Enter Price:',
                name: 'price',
                validate: function(name) {
                    if(name.indexOf('.') == -1) {
                        return false;
                    }
                    let periods = 0;
                    for(let i = 0; i < name.length; i++){
                        if(name[i] == '.') {
                            periods++;
                        }
                    }
                    if(periods != 1) {
                        return false;
                    }
                    let nums = name.split('.')
                    if(nums[1].length != 2) {
                        return false;
                    }
                    for(let i = 0; i < nums.length; i++) {
                        if(!storeDB.onlyNumbers(nums[i])){
                            return false;
                        }
                    }
                    return true;
                }
            },
            {
                type: 'input',
                message: 'Enter Initial Quantity:',
                name: 'quantity',
                validate: storeDB.onlyNumbers
            }
        ]).then(function(ans2) {
            con.query("INSERT INTO products SET ?",{
                product_name: ans2.itemName,
                department_name: ans2.deptName,
                price: ans2.price,
                stock_quantity: ans2.quantity
            },
            function(err, res){
                if(err) throw err;
                console.log("Successfully added " + ans2.itemName.yellow + colors.green(" (" + ans2.quantity + ')') + " to inventory!");
                mainMenu();
            });
        });//end new product details inquirer question
    });//end yes/no inquirer question
}

function nonEmptyString(str) {
    if(str.length == 0) {
        return false;
    } else {
        return true;
    }
}

function removeProduct() {
    storeDB.listProducts(con, function(res) {
        let items = [];
        for(let i = 0; i < res.length; i++) {
            items.push(res[i].item_id);
        }
        inq.prompt(
            {
                type: 'input',
                message: 'Enter Item ID number to remove:',
                name: 'id',
                validate: function(name) {
                    if(!storeDB.onlyNumbers(name)) {
                        return false;
                    }
                    if(items.indexOf(parseInt(name)) == -1) {
                        return false;
                    }
                    return true;
                }
            }
        ).then(function(ans){
            con.query('DELETE FROM products WHERE item_id = ?', [ans.id], function(err, res){
                if(err) throw err;
                console.log("\nSuccessfully removed " + colors.red("item_id#" + ans.id) + ' from catalog.\n');
                mainMenu();
            });//end delete query
        });//end inq prompt
    });//end list products
}

//connect to the db
con.connect(function(err){
    if (err) throw err;
    console.log("Connected as: " + con.threadId);
    mainMenu();
});