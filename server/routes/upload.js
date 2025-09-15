/**
 * Routes d'upload pour SPARK
 * Gestion de l'upload d'images pour les produits
 */

const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { authenticate, authorize } = require('../middleware/auth')

const router = express.Router()

// Configuration de multer pour l'upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads'
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const extension = path.extname(file.originalname)
    cb(null, `product-${uniqueSuffix}${extension}`)
  }
})

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    return cb(null, true)
  } else {
    cb(new Error('Seuls les fichiers image (JPEG, PNG, GIF, WebP) sont autorisés'))
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB par défaut
    files: 10 // Maximum 10 fichiers par requête
  },
  fileFilter: fileFilter
})

/**
 * POST /api/upload/images
 * Upload d'images pour les produits (admin seulement)
 */
router.post('/images', authenticate, authorize('admin'), upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'Aucun fichier',
        message: 'Aucun fichier n\'a été uploadé',
        timestamp: new Date().toISOString()
      })
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }))

    res.json({
      message: 'Images uploadées avec succès',
      files: uploadedFiles,
      count: uploadedFiles.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    
    // Supprimer les fichiers uploadés en cas d'erreur
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      })
    }

    res.status(500).json({
      error: 'Erreur d\'upload',
      message: error.message || 'Une erreur est survenue lors de l\'upload',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/upload/single
 * Upload d'une seule image
 */
router.post('/single', authenticate, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Aucun fichier',
        message: 'Aucun fichier n\'a été uploadé',
        timestamp: new Date().toISOString()
      })
    }

    const uploadedFile = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: `/uploads/${req.file.filename}`
    }

    res.json({
      message: 'Image uploadée avec succès',
      file: uploadedFile,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'upload:', error)
    
    // Supprimer le fichier uploadé en cas d'erreur
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({
      error: 'Erreur d\'upload',
      message: error.message || 'Une erreur est survenue lors de l\'upload',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * DELETE /api/upload/:filename
 * Supprimer une image
 */
router.delete('/:filename', authenticate, authorize('admin'), async (req, res) => {
  try {
    const filename = req.params.filename
    const uploadPath = process.env.UPLOAD_PATH || './uploads'
    const filePath = path.join(uploadPath, filename)

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'Fichier non trouvé',
        message: 'Le fichier demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Supprimer le fichier
    fs.unlinkSync(filePath)

    res.json({
      message: 'Fichier supprimé avec succès',
      filename,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    res.status(500).json({
      error: 'Erreur de suppression',
      message: 'Une erreur est survenue lors de la suppression du fichier',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/upload/list
 * Lister les fichiers uploadés
 */
router.get('/list', authenticate, authorize('admin'), async (req, res) => {
  try {
    const uploadPath = process.env.UPLOAD_PATH || './uploads'
    
    if (!fs.existsSync(uploadPath)) {
      return res.json({
        files: [],
        count: 0,
        timestamp: new Date().toISOString()
      })
    }

    const files = fs.readdirSync(uploadPath)
      .filter(file => {
        const filePath = path.join(uploadPath, file)
        return fs.statSync(filePath).isFile()
      })
      .map(file => {
        const filePath = path.join(uploadPath, file)
        const stats = fs.statSync(filePath)
        
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/${file}`
        }
      })
      .sort((a, b) => b.modified - a.modified)

    res.json({
      files,
      count: files.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la liste des fichiers:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération de la liste des fichiers',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * Middleware de gestion des erreurs multer
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'Fichier trop volumineux',
        message: `La taille du fichier ne peut pas dépasser ${process.env.MAX_FILE_SIZE || '5MB'}`,
        timestamp: new Date().toISOString()
      })
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Trop de fichiers',
        message: 'Le nombre maximum de fichiers autorisé est de 10',
        timestamp: new Date().toISOString()
      })
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Champ de fichier inattendu',
        message: 'Le champ de fichier doit être nommé "images" ou "image"',
        timestamp: new Date().toISOString()
      })
    }
  }
  
  if (error.message.includes('Seuls les fichiers image')) {
    return res.status(400).json({
      error: 'Type de fichier non autorisé',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  }
  
  next(error)
})

module.exports = router
