DROP DATABASE IF EXISTS blamazon_DB;

CREATE DATABASE blamazon_DB;

USE blamazon_DB;

CREATE TABLE products(
    item_id INTEGER(7) NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(60) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price DECIMAL(10,2) UNSIGNED NOT NULL,
    stock_quantity INTEGER(7) NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("empty beer bottle", "junk", 0.05, 1);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("Fender Mexican Strat", "Musical Instruments", 499.99, 1);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("bent paper clip", "junk", 0.01, 100);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("Billy Jo's 80 inch TV", "Electronics", 50.0, 1);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("lot of assorted crayon pieces", "junk", 1, 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("Okama Game Sphere", "Electronics", 299.00, 5);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("Neil Peart's Drum Set", "Musical Instruments", 20000, 1);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("lot of used guitar pics that survived the washer", "Musical Instruments", 2.00, 10);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("slightly used Samurai sword", "junk", 50, 1);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES("some busker's old guitar", "junk", 20, 2);

CREATE TABLE departments (
    department_id INTEGER(7) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(30) NOT NULL,
    over_head_costs DECIMAL(10,2) UNSIGNED NOT NULL,
    product_sales DECIMAL(10,2) UNSIGNED NOT NULL DEFAULT 0
);

INSERT INTO departments (department_name, over_head_costs)
VALUES("Electronics", 1000);

INSERT INTO departments (department_name, over_head_costs)
VALUES("junk", 100);

INSERT INTO departments (department_name, over_head_costs)
VALUES("Musical Instruments", 3000);