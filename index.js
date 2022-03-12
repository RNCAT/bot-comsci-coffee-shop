/* eslint-disable consistent-return */
/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const db = require('./models/firebase')

// const client = require('./models/line')
const userController = require('./controllers/user')
const botController = require('./controllers/bot')
// const productController = require('./controllers/product')
const cartController = require('./controllers/cart')

const app = express()
const port = process.env.PORT || 3001

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

app.post('/user/:userid', userController.register)
app.delete('/user/:userid', userController.logout)

app.post('/bot', botController.menu)

app.get('/products/:userId', (req, res) => {
  const { userId } = req.params

  try {
    const productPath = '/Products/'
    const products = db.ref(productPath)

    products.on(
      'value',
      async (snapshot) => {
        const prods = snapshot.val()

        const cartPath = '/Cart/'
        const cartdb = db.ref(cartPath)

        cartdb.child(userId).once('value', async (snapshot) => {
          const cart = snapshot.val()

          await prods.coffees.forEach((coff) => {
            let qty = 0
            if (cart && cart.coffees) {
              Object.keys(cart.coffees).map((key) =>
                cart.coffees[key].coffeeId === coff.coffeeId ? (qty += cart.coffees[key].qty) : 0
              )
            }
            coff.qty = qty
            coff.sweet = 1
            coff.type = 0
          })

          await prods.bakeries.forEach((baker) => {
            let qty = 0
            if (cart && cart.bakeries) {
              Object.keys(cart.bakeries).map((key) =>
                cart.bakeries[key].bakeryId === baker.bakeryId ? (qty += cart.bakeries[key].qty) : 0
              )
            }
            baker.qty = qty
          })

          return res.status(200).send({ error: false, message: 'product data', data: prods })
        })
      },
      (errorObject) => {
        console.log(`The read failed: ${errorObject.name}`)
      }
    )
  } catch (err) {
    // console.log(err)
    return err
  }
})
app.post('/cart', cartController.addCart)
app.delete('/cart', cartController.deleteCart)

app.listen(port, () => console.log(`listening at http://localhost:${port}`))
