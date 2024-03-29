const express = require('express');
const router = express.Router();
const Invoice = require('../model/invoice.model');

// GET: Retrieve all invoices
router.get('/', async (req, res) => {
	try {
		const invoices = await Invoice.find();
		res.json(invoices);
	} catch (err) {
		res.status(500).json({ error: 'Error retrieving invoices' });
	}
});

// POST: Create a new invoice
router.post('/', async (req, res) => {
	const {
		companydetails,
		sellerdetails,
		buyerdetails,
		vehicledetails,
		consignmentdetails,
		invoicedetails,
		boardingdetails,
		loadingdetails,
	} = req.body;

	try {
		const newInvoice = new Invoice({
			companydetails,
			sellerdetails,
			buyerdetails,
			vehicledetails,
			consignmentdetails,
			invoicedetails: {
				...invoicedetails,
				invoiceno: undefined,
				invoicedate: new Date(),
			}, // Set invoiceno in the schema
			boardingdetails,
			loadingdetails,
		});

		const savedInvoice = await newInvoice.save();
		const currentYear = new Date().getFullYear().toString().slice(-2);
		const counter = await Invoice.countDocuments({
			'invoicedetails.invoiceno': {
				$regex: new RegExp(`${currentYear}\\d{7}`),
			},
		}).exec();
		savedInvoice.invoicedetails.invoiceno = `${currentYear}${(counter + 1)
			.toString()
			.padStart(7, '0')}`;
		await savedInvoice.save();

		res.status(201).json(savedInvoice);
	} catch (err) {
		res.status(400).json({ error: 'Error creating invoice' });
	}
});

// PUT: Update an invoice by ID
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const updatedInvoiceData = req.body;

	try {
		const updatedInvoice = await Invoice.findByIdAndUpdate(
			id,
			updatedInvoiceData,
			{ new: true }
		);

		if (!updatedInvoice) {
			res.status(404).json({ error: 'Invoice not found' });
		} else {
			res.json(updatedInvoice);
		}
	} catch (err) {
		res.status(500).json({ error: 'Error updating invoice' });
	}
});

// DELETE: Delete an invoice by ID
router.delete('/:id', async (req, res) => {
	const { id } = req.params;

	try {
		const deletedInvoice = await Invoice.findByIdAndDelete(id);

		if (!deletedInvoice) {
			res.status(404).json({ error: 'Invoice not found' });
		} else {
			res.json(deletedInvoice);
		}
	} catch (err) {
		res.status(500).json({ error: 'Error deleting invoice' });
	}
});

module.exports = router;
