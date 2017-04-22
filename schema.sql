CREATE DATABASE Bamazon;

USE Bamazon;

CREATE TABLE products (
	item_id INTEGER(11) AUTO_INCREMENT NOT NULL,
    PRIMARY KEY(item_id),
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) default 0,
    stock_quantity INTEGER(15) NOT NULL
);

SELECT * FROM products;
SELECT FORMAT(price, 2) FROM products;

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Plumbus", "Random", 50.00, 10);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Dragonballs", "Random", 10.00, 6);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Toilet Paper (six pack)", "Household Goods", 5.00, 5);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Toothbrush", "Household Goods", 2.00, 20);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Apples", "Food", 0.65, 50);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Curry", "Food", 6.00, 10);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Bananas", "Food", 0.45, 40);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("bAlexa", "Technology", 200.00, 10);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("iPhone", "Technology", 800.00, 20);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES("Tamagotchi", "Technology", 5.00, 15);