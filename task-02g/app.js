const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 

app.use(express.static("public"));



app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});


const tasksFilePath = path.join(__dirname, "tasks.json");


const readTasks = () => {
    try {
        const data = fs.readFileSync(tasksFilePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};


const writeTasks = (tasks) => {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};


app.get("/tasks", (req, res) => {
    const tasks = readTasks();
    res.render("tasks", { tasks });
});


app.get("/task", (req, res) => {
    const tasks = readTasks();
    const task = tasks.find(t => t.id === parseInt(req.query.id));

    if (!task) {
        return res.status(404).send("Task not found");
    }
    
    res.render("task", { task });
});


app.get("/addTask", (req, res) => {
    res.render("addTask");
});


app.post("/add-task", (req, res) => {
    const { title, description } = req.body;
    if (!title) {
        return res.status(400).send("Title is required");
    }

    const tasks = readTasks();
    const newTask = {
        id: tasks.length + 1,
        title,
        description: description || "No description"
    };

    tasks.push(newTask);
    writeTasks(tasks);

    res.redirect("/tasks");
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
