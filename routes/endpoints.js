const authcontroller=require('../controllers/auth');

const initendpoints=(app)=>
{
    
    /** Categories Route */
     app.use('/auth',authcontroller);

    
}
module.exports=initendpoints;