const db = require('../db/db');

const getAllExpenses = async (req, res) => {
    const { truck_id } = req.query;
    try {
        let query = db('truck_expenses').orderBy('date', 'desc');
        if (truck_id) {
            query = query.where({ truck_id });
        }
        const expenses = await query;
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const createExpense = async (req, res) => {
    const { truck_id, description, amount, date, category } = req.body;
    try {
        const [newExpense] = await db('truck_expenses').insert({
            truck_id,
            description,
            amount,
            date,
            category
        }).returning('*');
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCount = await db('truck_expenses').where({ id }).del();
        if (deletedCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    getAllExpenses,
    createExpense,
    deleteExpense
};
