exports.statusCheck = (req, res) => {
    res.status(200).send({message: "Up and running"});
};
