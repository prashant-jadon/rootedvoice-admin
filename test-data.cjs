const axios = require('axios');
(async () => {
    try {
        const login = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@rootedvoices.com',
            password: 'SecurePass123!'
        });
        const token = login.data.token;
        const evals = await axios.get('http://localhost:5001/api/evaluations', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(JSON.stringify(evals.data.data.slice(0, 3), null, 2));
    } catch (e) {
        console.error(e.message);
    }
})();
