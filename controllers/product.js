/* eslint-disable no-return-assign */
/* eslint-disable no-param-reassign */
const db = require('../models/firebase')

async function getProducts(req, res) {
  const { userID } = req.params

  try {
    const productPath = '/Products/'
    const products = db.ref(productPath)

    products.on(
      'value',
      async (snapshot) => {
        const prods = snapshot.val()

        const cartPath = '/Cart/'
        const cartdb = db.ref(cartPath)

        cartdb.child(userID).once('value', async (snapshots) => {
          const cart = snapshots.val()

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
              // eslint-disable-next-line no-return-assign
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
    return err
  }
}

module.exports = { getProducts }
