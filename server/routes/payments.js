/**
 * Routes de paiement pour SPARK
 * Intégration Stripe et PayPal
 */

const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const paypal = require('@paypal/checkout-server-sdk')

// Configuration PayPal
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
)
const client = new paypal.core.PayPalHttpClient(environment)

/**
 * @route   GET /api/payments/methods
 * @desc    Obtenir les méthodes de paiement disponibles
 * @access  Public
 */
router.get('/methods', async (req, res) => {
  try {
    const methods = [
      {
        id: 'stripe',
        name: 'Carte bancaire',
        description: 'Visa, Mastercard, American Express',
        icon: '💳',
        enabled: true,
        fees: {
          percentage: 2.9,
          fixed: 0.25
        }
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Paiement rapide et sécurisé',
        icon: '🅿️',
        enabled: true,
        fees: {
          percentage: 3.4,
          fixed: 0.35
        }
      }
    ]

    res.json({
      success: true,
      data: { methods }
    })
  } catch (error) {
    console.error('Erreur méthodes de paiement:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des méthodes de paiement'
    })
  }
})

/**
 * @route   POST /api/payments/stripe/create-intent
 * @desc    Créer un intent de paiement Stripe
 * @access  Private
 */
router.post('/stripe/create-intent', auth, async (req, res) => {
  try {
    const { amount, currency = 'eur', orderData, billingAddress } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      })
    }

    // Créer l'intent de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency,
      metadata: {
        userId: req.user.id,
        orderId: orderData?.orderId || 'temp',
        billingAddress: JSON.stringify(billingAddress)
      },
      automatic_payment_methods: {
        enabled: true
      }
    })

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
      }
    })
  } catch (error) {
    console.error('Erreur création intent Stripe:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement'
    })
  }
})

/**
 * @route   POST /api/payments/stripe/confirm
 * @desc    Confirmer un paiement Stripe
 * @access  Private
 */
router.post('/stripe/confirm', auth, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'ID de paiement requis'
      })
    }

    // Récupérer l'intent de paiement
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        success: false,
        message: 'Paiement non réussi'
      })
    }

    // TODO: Mettre à jour la commande dans la base de données
    // await Order.findByIdAndUpdate(orderId, {
    //   status: 'paid',
    //   paymentIntentId,
    //   paidAt: new Date()
    // })

    res.json({
      success: true,
      data: {
        paymentIntent,
        orderId
      }
    })
  } catch (error) {
    console.error('Erreur confirmation Stripe:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la confirmation du paiement'
    })
  }
})

/**
 * @route   POST /api/payments/paypal/create-order
 * @desc    Créer une commande PayPal
 * @access  Private
 */
router.post('/paypal/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'EUR', orderData } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      })
    }

    const request = new paypal.orders.OrdersCreateRequest()
    request.prefer('return=representation')
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        },
        metadata: {
          userId: req.user.id,
          orderId: orderData?.orderId || 'temp'
        }
      }],
      application_context: {
        brand_name: 'SPARK',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.CLIENT_URL}/checkout?success=true`,
        cancel_url: `${process.env.CLIENT_URL}/checkout?cancelled=true`
      }
    })

    const order = await client.execute(request)

    res.json({
      success: true,
      data: {
        orderId: order.result.id,
        approvalUrl: order.result.links.find(link => link.rel === 'approve').href
      }
    })
  } catch (error) {
    console.error('Erreur création commande PayPal:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la commande PayPal'
    })
  }
})

/**
 * @route   POST /api/payments/paypal/capture
 * @desc    Capturer un paiement PayPal
 * @access  Private
 */
router.post('/paypal/capture', auth, async (req, res) => {
  try {
    const { orderID } = req.body

    if (!orderID) {
      return res.status(400).json({
        success: false,
        message: 'ID de commande requis'
      })
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID)
    request.requestBody({})

    const capture = await client.execute(request)

    if (capture.result.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Paiement non complété'
      })
    }

    // TODO: Mettre à jour la commande dans la base de données
    // await Order.findByIdAndUpdate(orderId, {
    //   status: 'paid',
    //   paypalOrderId: orderID,
    //   paidAt: new Date()
    // })

    res.json({
      success: true,
      data: {
        order: capture.result,
        orderId: orderID
      }
    })
  } catch (error) {
    console.error('Erreur capture PayPal:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la capture du paiement'
    })
  }
})

/**
 * @route   GET /api/payments/status/:paymentId
 * @desc    Vérifier le statut d'un paiement
 * @access  Private
 */
router.get('/status/:paymentId', auth, async (req, res) => {
  try {
    const { paymentId } = req.params
    const { method } = req.query

    let status = 'unknown'

    if (method === 'stripe') {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
      status = paymentIntent.status
    } else if (method === 'paypal') {
      const request = new paypal.orders.OrdersGetRequest(paymentId)
      const order = await client.execute(request)
      status = order.result.status
    }

    res.json({
      success: true,
      data: { status }
    })
  } catch (error) {
    console.error('Erreur vérification statut:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut'
    })
  }
})

/**
 * @route   POST /api/payments/refund
 * @desc    Rembourser un paiement
 * @access  Private (Admin)
 */
router.post('/refund', auth, async (req, res) => {
  try {
    const { paymentId, amount, method } = req.body

    if (!paymentId || !method) {
      return res.status(400).json({
        success: false,
        message: 'ID de paiement et méthode requis'
      })
    }

    let refund

    if (method === 'stripe') {
      const refundData = {
        payment_intent: paymentId
      }
      
      if (amount) {
        refundData.amount = Math.round(amount * 100) // Convertir en centimes
      }

      refund = await stripe.refunds.create(refundData)
    } else if (method === 'paypal') {
      // TODO: Implémenter le remboursement PayPal
      return res.status(501).json({
        success: false,
        message: 'Remboursement PayPal non implémenté'
      })
    }

    res.json({
      success: true,
      data: { refund }
    })
  } catch (error) {
    console.error('Erreur remboursement:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du remboursement'
    })
  }
})

/**
 * @route   POST /api/payments/webhook/stripe
 * @desc    Webhook Stripe pour les événements de paiement
 * @access  Public
 */
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Erreur webhook Stripe:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        console.log('Paiement réussi:', paymentIntent.id)
        
        // TODO: Mettre à jour la commande
        // await Order.findOneAndUpdate(
        //   { paymentIntentId: paymentIntent.id },
        //   { status: 'paid', paidAt: new Date() }
        // )
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        console.log('Paiement échoué:', failedPayment.id)
        
        // TODO: Mettre à jour la commande
        // await Order.findOneAndUpdate(
        //   { paymentIntentId: failedPayment.id },
        //   { status: 'payment_failed' }
        // )
        break

      default:
        console.log(`Événement non géré: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Erreur traitement webhook:', error)
    res.status(500).json({ error: 'Erreur traitement webhook' })
  }
})

module.exports = router
