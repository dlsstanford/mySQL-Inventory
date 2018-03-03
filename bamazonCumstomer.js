var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

function start() {
  inquirer
    .prompt({
      name: "itempicker",
      type: "input",
      message: "Enter the ID of the number you would like to purchase:"
    })
    .then(function(answer) {
      connection.query(
        "SELECT * FROM products WHERE ?",
        { id: answer.itempicker },
        function(err, res) {
          console.log(
            "Product: " +
              res[0].product_name +
              " || Department: " +
              res[0].department_name +
              " || Price: " +
              res[0].price +
              " || Quantity: " +
              res[0].stock_quantity
          );
          buyItem(
            res[0].product_name,
            res[0].department_name,
            res[0].price,
            res[0].stock_quantity
          );
        }
      );
    });
}

function buyItem(name, dept, price, quantity) {
  inquirer
    .prompt({
      name: "quantitypicker",
      type: "input",
      message: "How many would you like to purchase?"
    })
    .then(function(answer) {
        var numPurchased = answer.quantitypicker
      var newQuantity = quantity - answer.quantitypicker;
      var totalPrice = price * numPurchased

      console.log(
        "\nYou are Purchasing " +
          answer.quantitypicker +
          "(s) " +
          name +
          " at $" +
          price +
          " each."
      );
      console.log("---------------------------");
      if (answer.quantitypicker < quantity) {
        console.log("this item is avaliable for purchase\n");
        updateProduct(name, dept, price, quantity, newQuantity, totalPrice, numPurchased);
      } else {
        console.log("INSUFFICIENT QUANTITY\n");
        connection.end();
      }
    });
}

function updateProduct(name, dept, price, quantity, newQuantity, totalPrice, numPurchased) {
  console.log("Updating product information...\n");
  console.log("---------------------------");
  console.log("New product inventory totals:\n");
  console.log(
    "Product: " +
      name +
      " || Department: " +
      dept +
      " || Price: " +
      price +
      " || Quantity: " +
      newQuantity
  );
  
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: newQuantity
      },
      {
        product_name: name
      }
    ],
    function(err, res) {
        console.log("Thank you for your purchase of " + numPurchased + " " + name + "(s)! your total comes out to $" + totalPrice + "!");
        console.log("---------------------------");
      console.log(name + " inventory updated to " + newQuantity + "!");
      connection.end();
    }
  );
}
