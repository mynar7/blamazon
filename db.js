const {table} = require('table');

function db() {
    this.host = 'localhost',
    this.port = 3306,
    this.user = 'root',
    this.password = 'root',
    this.database = 'blamazon_DB'
}

db.prototype.credentials = function() {
    return {
        host: this.host,
        port: this.port,
        user: this.user,
        password: this.password,
        database: this.database
    };
}

//query for available products, then display them, then do a callback
db.prototype.listProducts = function(con, callback, arg) {
    con.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        db.prototype.displayProducts(res);
        if(callback) {
            callback(res, arg);
        }
    })//end query
}//end function

db.prototype.listLowProducts = function(con, callback, arg) {
    con.query("SELECT * FROM products WHERE stock_quantity < 5", function(err, res) {
        if (err) throw err;
        db.prototype.displayProducts(res);
        if(callback) {
            callback(res, arg);
        }
    })//end query
}//end function

//uses table and colors npm to display data in nice format
db.prototype.displayProducts = function (arr) {
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

//validate function to ensure a string only contains numbers
db.prototype.onlyNumbers = function (str) {
    if(str.length == 0) return false;
    for(let i = 0; i < str.length; i++) {
        if(str.charCodeAt(i) < 48 || str.charCodeAt(i) > 57) {
            return false;
        }
    } //end for loop
    return true;
}

db.prototype.onlyFloats = function(name) {
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
        if(!db.prototype.onlyNumbers(nums[i])){
            return false;
        }
    }
    return true;
}

db.prototype.nonEmptyString = function (str) {
    if(str.length == 0) {
        return false;
    } else {
        return true;
    }
}

module.exports = db;