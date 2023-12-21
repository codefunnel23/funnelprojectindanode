const {Router} = require('express');
const testimonialController = require('../controllers/testimonialController');

const router = Router();

router.post('/create-testimonial', testimonialController.createTestimonial);

router.put('/edit-testimonial/:id', testimonialController.editTestimonial);

router.post('/delete-testimonial/:id', testimonialController.deleteTestimonial);

router.get('/testimonials', testimonialController.allTestimonials);

module.exports = router;