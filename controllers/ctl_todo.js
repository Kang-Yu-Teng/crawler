const todoModel = import('../models/mod_todo.js');  // 引入 model

const todoController = {
  getAll: (req, res) => {
    const todos = todoModel.getAll()   // 把 todos 用 getAll 拿出來
    res.render('todo', {
      todos
    })
  },

  get: (req, res) => {
    const id = req.params.id
    const todo = todoModel.get(id)
    res.render('todo', {
      todo
    })
  }
}

export default todoController;