const swaggerUi=require('swagger-ui-express');
const swaggerJsdoc=require('swagger-jsdoc');
const options={
swaggerDefinition:{

   info :{
   version:'1.0.0',
    title:'Auth Api',
    description:'Testing swagger',
   },
   basePath:'localhost:5000',

},
apis:['./routes/endpoints.js'],

};
const specs=swaggerJsdoc(options);
const testFunction=(app)=>
{
    app.use('/docs',swaggerUi.serve,swaggerUi.setup(specs));
}
module.exports=testFunction;