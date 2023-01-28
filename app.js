const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set("strictQuery", false)
mongoose.connect("mongodb+srv://admin-kishore:Test123@cluster0.yhnco9i.mongodb.net/todolistDB");


const itemsSchema = new mongoose.Schema({
  name: String
})
const listSchema = new mongoose.Schema({
  name:String,
  items:[itemsSchema]
})
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "WElcome to your todolist"
})
const item2 = new Item({
  name: "Hit + button to add a item"
})
const item3 = new Item({
  name: "hit --> button to delete an item"
})
const defaultItem = [item1, item2, item3];
const List = mongoose.model("List",listSchema);

app.get("/", function (req, res) {
  Item.find((err, results) => {
    if (err) {
      console.log(err);
    } else {
      if (results.length === 0) {
        Item.insertMany(defaultItem, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("Inserted Sucessfully");
          }
        })
        res.redirect("/");
      }else{
        res.render("list", { listTitle: "Today", newListItems: results });
      }
      
    }
  })




});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  })
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,results){
      results.items.push(item);
      results.save();
      res.redirect("/"+listName);
    });
  }
 

  
});
app.post("/delete",function (req,res){
  const checkedItemId=req.body.checkbox;
  const listName = req.body.listName;
  if (listName==="Today") {
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted Successfully");
        res.redirect("/");
      }
    })
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
  
});

app.get("/:customListName",function(req,res){
      const customListName = _.capitalize(req.params.customListName);
      
      List.findOne({name:customListName},(err,foundList)=>{
        if (!err) {
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItem
            })
            list.save();
            res.redirect("/"+customListName);
          }else{
            res.render("list",{ listTitle: foundList.name, newListItems: foundList.items });
          }
        }
      })
})

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, function () {
  console.log("Server started on port 3000");
});
