import promisePool from '../utils/database.js';

const getAllUsers = async () => {
  const [rows] = await promisePool.query('SELECT * FROM Users');
  console.log(rows);
  return rows;
};

export {getAllUsers};