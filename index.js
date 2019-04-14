const express = require('express')
const app = express()
const bodyParser = require('body-parser')


const sqlite = require('sqlite')
const dbConnection = sqlite.open('database.sqlite', { Promise })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))


app.get('/', async(request, response) => {
    //response.send('<h1>Ola full stack lab</h1>')
    const db = await dbConnection
    const categoriesDb = await db.all('select * from category;')
    const roles = await db.all('select * from role;')
    const categories = categoriesDb.map(cat => {
        return {
            ...cat,
            roles: roles.filter(role => role.category === cat.id)
        }
    })
    response.render('home', {categories})
})

app.get('/role/:id', async(request, response) => {
    const db = await dbConnection
    const role = await db.get('select * from role where id = ' + request.params.id)
    response.render('role', {role})
})

app.get('/admin', (req, res) => {
    res.render('admin/home')
})

app.get('/admin/roles', async (req, res) => {
    const db = await dbConnection
    const roles = await db.all('select * from role;')
    res.render('admin/roles',{roles})
})

app.get('/admin/roles/delete/:id', async (req, res) => {
    const db = await dbConnection
    await db.run('delete from role where id = ' + req.params.id)
    res.redirect('/admin/roles')
})

app.get('/admin/roles/new', async (req, res) => {
    const db = await dbConnection

    const categories = await db.all('select * from category')

    res.render('admin/new-role', { categories })
})

app.post('/admin/roles/new', async (req, res) => {
    const { title, description, category } = req.body
    const db = await dbConnection
    await db.run(`insert into role (category, title, description) values (${category}, '${title}', '${description}')`)
    res.redirect('/admin/roles')
})

app.get('/admin/roles/edit/:id', async (req, res) => {
    const db = await dbConnection
    const categories = await db.all('select * from category')
    const role = await db.get('select * from role where id = ' + req.params.id)
    res.render('admin/edit-role', { categories, role })
})

app.post('/admin/roles/edit/:id', async (req, res) => {
    const { title, description, category } = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update role set category = ${category}, title = '${title}', description ='${description}' where id = ${id}`)
    res.redirect('/admin/roles')
})

const init = async() => {
    const db = await dbConnection
    await db.run('create table if not exists category (id INTEGER PRIMARY KEY, name TEXT );')
    await db.run('create table if not exists role (id INTEGER PRIMARY KEY, category INTEGER, title TEXT, description TEXT );')

    // const category = 'Marketing team'
    // await db.run(`insert into category (name) values ('${category}')`)

    //const role = 'Full Stack Developer (Remote)'
    //const description = 'Vaga para Full Stack Developer que fez o Full Stack Lab'

    //const role = 'Social Media (San Francisco)'

    //await db.run(`insert into role (category, title, description) values (1, '${role}', '${description}')`)

}

init()

app.listen(3000, (err) => {
    if(err) {
        console.log('Nao foi possivel iniciar o servidor do Jobify')
    } else {
        console.log('Servidor do Jobify inicializado...')
    }
})