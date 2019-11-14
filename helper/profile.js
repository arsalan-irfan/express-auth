module.exports={
    setProfile:(user)=>{
        const {user_id,firstname,lastname,email,createdAt,updatedAt} = user;
        const profile ={user_id,firstname,lastname,email,createdAt,updatedAt};
        return profile;         
    }
}