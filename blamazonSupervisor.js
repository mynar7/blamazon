const inq = require("inquirer");
const mysql = require("mysql");
const colors = require("colors");
const db = require("./db.js");
const {table} = require('table');
const storeDB = new db();

//get credentials
let con = mysql.createConnection(storeDB.credentials());

//create new dept

//view product sales
function mainMenu() {
    inq.prompt(
        {
            type: 'list',
            name: 'choice',
            choices: ["View Sales Data", 'Create New Department', 'Exit'],
            message: 'Welcome to Blamazon Supervisor View'.magenta
        }
    ).then(function(ans){
        switch(ans.choice) {
            case "View Sales Data":
                getSales();
                break;
            case 'Create New Department':
                newDept();
                break;
            default:
                con.end()
                return console.log("\nHave a Great Day".rainbow);
                break;
        }   
    });
}

function newDept() {
    inq.prompt(
        {
            type: 'list',
            message: "Make new department?",
            name: 'choice',
            choices: ['Yes', ' No']
        }
    ).then(function(ans) {
        if(ans.choice == 'No') {
            return mainMenu();
        }
        inq.prompt([
            {
                type: 'input',
                message: 'Enter Department Name',
                name: 'deptName',
                validate: storeDB.nonEmptyString
            },
            {
                type: 'input',
                message: 'Enter Over Head Cost Amount',
                name: 'overhead',
                validate: storeDB.onlyFloats
            }
        ]).then(function(ans2){
            con.query('INSERT INTO departments SET ?',
                {
                    department_name: ans2.deptName,
                    over_head_costs: ans2.overhead
                },
                function(err, res) {
                    if(err) throw err;
                    console.log(colors.yellow(ans2.deptName) + " successfully added to departments.");
                    mainMenu();
                }//end query callback
            );//end query
        });//end new Dept prompt
    }); //end yes/no confirm
} //end fx

function getSales() {
    con.query('SELECT * FROM departments', null, function(err, res){
        if(err) throw err;
        let data = [];
        let headerRow = [
            "Department ID".cyan,
            "Department Name".cyan,
            "Overhead Costs".cyan,
            "Product Sales".cyan,
            "Total Profit".cyan
        ];
        data.push(headerRow);
        for(let i = 0; i < res.length; i++) {
            let row = [
                res[i].department_id,
                colors.yellow(res[i].department_name),
                colors.magenta(res[i].over_head_costs),
                colors.cyan(res[i].product_sales)
            ];
            let profit = parseFloat(res[i].product_sales) - parseFloat(res[i].over_head_costs);
            if(profit > 0) {
                profit = colors.green(profit);
            } else {
                profit = colors.red(profit);
            }
            row.push(profit);
            data.push(row);
        }
        let output = table(data);
        console.log(output);
        mainMenu();
    });
}

con.connect(function(err){
    if (err) throw err;
    console.log("Connected as: ".yellow + con.threadId);
    mainMenu();
});