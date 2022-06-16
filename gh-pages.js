var ghpages = require('gh-pages');

ghpages.publish(
    'public', // path to public directory
    {
        branch: 'gh-pages',
        repo: 'https://github.com/p-sjunnestrand/p-sjunnestrand.git', // Update to point to your repository  
        user: {
            name: 'Petter Sjunnestrand', // update to use your name
            email: 'p.sjunnestrand@gmail.com' // Update to use your email
        }
    },
    () => {
        console.log('Deploy Complete!')
    }
)