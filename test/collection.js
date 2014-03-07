var arango, db, checksum, role;
var port;
try {
    arango = require('arangojs')
} catch (e) {
    arango = require('..')
}

function check(done, f) {
    try {
        f()
        done()
    } catch (e) {
        console.log(e);
        done(e)
    }
}

describe("collections", function() {
    if (typeof window !== "undefined") {
        port = window.port;
    } else {
        port = require('./port.js');
        port = port.port;
    }

    var db = arango.Connection("http://127.0.0.1:"+port);

    describe("create", function() {
        var collection = "test1",
            options = {
                journalSize: 12345678,
                waitForSync: true,
                keyOptions: {
                    offset: 0,
                    increment: 5,
                    allowUserKeys: true
                }
            };

        before(function(done) {
            this.timeout(50000);
            db.admin.role(function(err, ret, message) {
                check(done, function() {
                    role = ret.role;
                });
            });
        })

        beforeEach(function(done) {
			this.timeout(50000);
            db.collection.delete(collection, function() {
                done()
            });
        })

        it('should be able to create a collection by name', function(done) {
			this.timeout(50000);
            db.collection.create(collection, function(err, ret) {
                check(done, function() {
                    ret.isSystem.should.eql(false);
                    ret.status.should.eql(3);
                    ret.type.should.eql(2);
                    ret.isVolatile.should.eql(false);
                    ret.error.should.eql(false);
                });
            });
        })

        it('should be able to pass options and getProperties', function(done) {
			this.timeout(50000);
            db.collection.create(collection, options, function(err, ret) {
                check(done, function() {
                    ret.waitForSync.should.eql(options.waitForSync);
                    db.collection.getProperties(ret.id, function(err, prop) {
                        /* note: rounded to KB */
                        (prop.journalSize >> 10).should.equal(options.journalSize >> 10);
                        prop.keyOptions.should.eql(options.keyOptions);
                        done();
                    })
                });
            });
        })
    })

    describe("collection", function() {

        db = new arango.Connection("http://127.0.0.1:"+port);

        before(function(done) {
			this.timeout(50000);
            db.database.delete("newDatabase", function(err, ret) {
                db.database.create("newDatabase", function(err, ret) {
                    db = db.use('/newDatabase');
                    done();
                });
            });

        })

        describe("collection Functions", function() {
            it('should be able to create a collection by name', function(done) {
			    this.timeout(50000);
                var options = {
                    journalSize: 12345678,
                    waitForSync: true,
                    keyOptions: {
                        offset: 0,
                        increment: 5,
                        allowUserKeys: true
                    }
                };
                db.collection.create("newCollection", options, function(err, ret, message) {
                    check(done, function() {
                        ret.isSystem.should.equal(false);
                        ret.status.should.equal(3);
                        ret.type.should.equal(2);
                        ret.isVolatile.should.equal(false);
                        ret.error.should.equal(false);
                        message.status.should.equal(200);
                    });
                });
            })
            it('should be able to create another collection by name', function(done) {
			    this.timeout(50000);
                db.collection.create("newCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.isSystem.should.equal(false);
                        ret.status.should.equal(3);
                        ret.type.should.equal(2);
                        ret.isVolatile.should.equal(false);
                        ret.error.should.equal(false);
                        message.status.should.equal(200);
                    });
                });
            })

            it('list all collections including system', function(done) {
			    this.timeout(50000);
                db.collection.list(function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        message.status.should.equal(200);
                    });
                });
            })
            it('list all collections excluding system', function(done) {
			    this.timeout(50000);
                db.collection.list(true, function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        ret.collections.length.should.equal(2);
                        message.status.should.equal(200);
                    });
                });
            })

            it('get collection', function(done) {
			    this.timeout(50000);
                db.collection.get("newCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        ret.type.should.equal(2);
                        message.status.should.equal(200);
                    });
                });
            })
            it('get non existing collection', function(done) {
			    this.timeout(50000);
                db.collection.get("ndddewCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(true);
                        message.status.should.equal(404);
                    });
                });
            })
            it('delete collection', function(done) {
			    this.timeout(50000);
                db.collection.delete("newCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        message.status.should.equal(200);
                    });
                });
            })
            it('delete non existing collection', function(done) {
			    this.timeout(50000);
                db.collection.delete("ndddewCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(true);
                        message.status.should.equal(404);
                    });
                });
            })

            it('truncate collection', function(done) {
			    this.timeout(50000);
                db.collection.truncate("newCollection", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        message.status.should.equal(200);
                    });
                });
            })
            it('truncate non existing collection', function(done) {
			    this.timeout(50000);
                db.collection.truncate("ndddewCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(true);
                        message.status.should.equal(404);
                    });
                });
            })

            it('count documents in collection', function(done) {
			    this.timeout(50000);
                db.collection.count("newCollection", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        ret.count.should.equal(0);
                        message.status.should.equal(200);
                    });
                });
            })
            it('count documents in non existing collection', function(done) {
			    this.timeout(50000);
                db.collection.count("ndddewCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(true);
                        message.status.should.equal(404);
                    });
                });
            })

            it('get figures of collection', function(done) {
			    this.timeout(50000);
                db.collection.figures("newCollection", function(err, ret, message) {
                    check(done, function() {
                        ret.count.should.equal(0);
                        ret.should.have.property("figures");
                        ret.error.should.equal(false);
                        message.status.should.equal(200);
                    });
                });
            })
            it('get figures of non existing collection', function(done) {
			    this.timeout(50000);
                db.collection.figures("ndddewCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(true);
                        message.status.should.equal(404);
                    });
                });
            })

            it('load collection', function(done) {
			    this.timeout(50000);
                db.collection.load("newCollection", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        ret.should.have.property("count");
                        message.status.should.equal(200);
                    });
                });
            })
            it('load collection with count = false', function(done) {
			    this.timeout(50000);
                db.collection.load("newCollection", false, function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        ret.should.not.have.property("count");
                        message.status.should.equal(200);
                    });
                });
            })
            it('load non existing collection', function(done) {
			    this.timeout(50000);
                db.collection.load("ndddewCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(true);
                        message.status.should.equal(404);
                    });
                });
            })

            it('unload collection', function(done) {
			    this.timeout(50000);
                db.collection.unload("newCollection", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(false);
                        message.status.should.equal(200);
                    });
                });
            })
            it('unload non existing collection', function(done) {
			    this.timeout(50000);
                db.collection.unload("ndddewCollection2", function(err, ret, message) {
                    check(done, function() {
                        ret.error.should.equal(true);
                        message.status.should.equal(404);
                    });
                });
            })
            if (role === "UNDEFINED") {
                it('rename of collection', function(done) {
                    this.timeout(50000);
                    db.collection.rename("newCollection", "newCollectionName", function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(false);
                            message.status.should.equal(200);
                        });
                    });
                })
                it('rename of non existing collection', function(done) {
                    this.timeout(50000);
                    db.collection.rename("ndddewCollection2", "newCollectionName", function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(true);
                            message.status.should.equal(404);
                        });
                    });
                })
                it('getProperties of collection', function(done) {
                    this.timeout(50000);
                    db.collection.getProperties("newCollectionName", function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(false);
                            ret.keyOptions.allowUserKeys.should.equal(true);
                            message.status.should.equal(200);
                        });
                    });
                })
                it('getProperties of non existing collection', function(done) {
                    this.timeout(50000);
                    db.collection.getProperties("ndddewCollection2", function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(true);
                            message.status.should.equal(404);
                        });
                    });
                })
                it('setProperties of collection', function(done) {
                    this.timeout(50000);
                    db.collection.setProperties("newCollectionName", {}, function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(false);
                            message.status.should.equal(200);
                        });
                    });
                })
                it('setProperties of non existing collection', function(done) {
                    this.timeout(50000);
                    db.collection.setProperties("ndddewCollection2", {}, function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(true);
                            message.status.should.equal(404);
                        });
                    });
                })
                it('revision of collection', function(done) {
                    this.timeout(50000);
                    db.collection.revision("newCollectionName", function(err, ret, message) {
                        check(done, function() {
                            ret.should.have.property("revision");
                            ret.error.should.equal(false);
                            message.status.should.equal(200);
                        });
                    });
                })
                it('revision of non existing collection', function(done) {
                    this.timeout(50000);
                    db.collection.revision("ndddewCollection2", function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(true);
                            message.status.should.equal(404);
                        });
                    });
                })

                it('create a document so we have a proper checksum', function(done) {
                    this.timeout(50000);
                    db.document.create("newCollectionName", {
                        "key1": "val1",
                        "key2": "val2",
                        "key3": null
                    }, null, function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(false);
                            message.status.should.equal(201);
                        });
                    });
                })

                it('checksum of collection', function(done) {
                    this.timeout(50000);
                    db.collection.checksum("newCollectionName", function(err, ret, message) {
                        check(done, function() {
                            ret.should.have.property("checksum");
                            checksum = ret.checksum;
                            ret.error.should.equal(false);
                            message.status.should.equal(200);
                        });
                    });
                })
                it('checksum of collection with data and revision used for calculation', function(done) {
                    this.timeout(50000);
                    db.collection.checksum("newCollectionName", {
                        withRevisions: true,
                        withData: true
                    }, function(err, ret, message) {
                        check(done, function() {
                            ret.should.have.property("checksum");
                            ret.checksum.should.not.equal(checksum);
                            ret.error.should.equal(false);
                            message.status.should.equal(200);
                        });
                    });
                })
                it('checksum of non existing collection', function(done) {
                    this.timeout(50000);
                    db.collection.checksum("ndddewCollection2", function(err, ret, message) {
                        check(done, function() {
                            ret.error.should.equal(true);
                            message.status.should.equal(404);
                        });
                    });
                })
            }
        })
        if (role === "COORDINATOR") {
            describe("Cluster collection Functions", function() {

                var options = {
                    journalSize: 12345678,
                    waitForSync: true,
                    numberOfShards : 2,
                    shardKeys : ["_key1", "_key2"],
                    keyOptions: {
                        type: "autoincrement",
                        offset: 0,
                        increment: 5,
                        allowUserKeys: true
                    }
                };
                it('should be able to create a cluster collection by name', function(done) {
                    this.timeout(50000);
                    db.collection.create("clusterCollection", options, function(err, ret) {
                        check(done, function() {
                            db.collection.getProperties(ret.id, function(err, prop) {
                                /* note: rounded to KB */
                                (prop.journalSize >> 10).should.equal(options.journalSize >> 10);
                                prop.keyOptions.should.eql(options.keyOptions);
                                prop.numberOfShards.shoudl.eql(options.numberOfShards);
                                prop.shardKeys.shoudl.eql(options.shardKeys);
                                done();
                            })
                        });
                    });
                })
            })
        }

    })

})
