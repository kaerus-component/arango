try{ arango = require('arango') } catch (e){ arango = require('..') }

function jerr(o){return JSON.stringify(o,null,2)}

describe("collection",function(){
	var db = new arango.Connection("http://127.0.0.1:8529");

	describe("create",function(){
		var collection = "test1", 
			options = {
					journalSize: 12345678,
					waitForSync: true,
					keyOptions: { 
						type: "autoincrement",
						offset: 0, 
						increment: 5, 
						allowUserKeys: true 
					}
			};

		beforeEach(function(done){
			db.collection.delete(collection,function(){ done() });
		})

		it('should be able to create a collection by name',function(done){
			db.collection.create(collection,function(err,ret){
				ret.isSystem.should.eql(false);
				ret.status.should.eql(3);
				ret.type.should.eql(2);
				ret.isVolatile.should.eql(false);
				ret.error.should.eql(false);
				done(err?jerr(ret):err);
			});
		})

		it('should be able to pass options and getProperties',function(done){
			db.collection.create(collection,options,function(err,ret){
				ret.waitForSync.should.eql(options.waitForSync);
				db.collection.getProperties(ret.id,function(err,prop){
 					(prop.journalSize >> 10).should.equal(options.journalSize >> 10);
					prop.keyOptions.should.eql(options.keyOptions);
					done(err?jerr(ret):err);
				})
			});
		})
	})

	describe("get",function(){
		var collection = "test2";

		beforeEach(function(done){
			db.collection.create(collection,{journalSize:10000000, waitForSync:true},function(err,ret){
				done(err?jerr(ret):err); 
			});
		})

		afterEach(function(done){
			db.collection.delete(collection,function(err,ret){
				done(err?jerr(ret):err); 
			});
		})

		describe('collection get',function(done){
			it('list',function(done){
				db.collection.list(false).then(function(res){
					done();
				},function(e){ throw e });
			})

			it('by name',function(done){
				db.collection.get(collection,function(err,ret){
					done(err);
				});
			})

			it('by id',function(done){
				db.collection.get(collection,function(err,ret){
					if(err) done(err);

					db.collection.get(ret.id,function(err,ret){
						done(err);
					});
				});
			})

			it('revision',function(done){
				db.collection.get(collection,function(err,ret){
					if(err) done(err);

					db.collection.revision(ret.id,function(err,ret){
						done(err);
					});
				});
			})

			it('count',function(done){
				db.collection.get(collection,function(err,ret){
					if(err) done(err);

					db.collection.count(ret.id,function(err,ret){
						done(err);
					});
				});
			})

			it('figures',function(done){
				db.collection.get(collection,function(err,ret){
					if(err) done(err);

					db.collection.figures(ret.id,function(err,ret){
						done(err);
					});
				});
			})

            it('checksum',function(done){
                db.collection.get(collection,function(err,ret){
                    if(err) done(err);

                    db.collection.checksum(ret.id,function(err,ret){
                        done(err);
                    });
                });
            })

            it('rename',function(done){
                db.collection.get(collection,function(err,ret){
                    if(err) done(err);

                    db.collection.rename(ret.id, "heinz", function(err,ret){
                        done(err);
                    });
                });
            })

            it('load',function(done){
                db.collection.get(collection,function(err,ret){
                    if(err) done(err);

                    db.collection.load(ret.id, function(err,ret){
                        done(err);
                    });
                });
            })

            it('unload',function(done){
                db.collection.get(collection,function(err,ret){
                    if(err) done(err);

                    db.collection.unload(ret.id, function(err,ret){
                        done(err);
                    });
                });
            })

            it('properties',function(done){
				db.collection.get(collection,function(err,ret){
					if(err) done(err);

					db.collection.getProperties(ret.id,function(err,ret){
						done(err);
					});
				});
			})

            it('truncate',function(done){
                db.collection.get(collection,function(err,ret){
                    if(err) done(err);

                    db.collection.truncate(ret.id,function(err,ret){
                        done(err);
                    });
                });
            })

            it('list',function(done){
                db.collection.get(collection,function(err,ret){
                    if(err) done(err);

                    db.collection.list(true,function(err,ret){
                        done(err);
                    });
                });
            })


            it('setProperties',function(done){
                db.collection.get(collection,function(err,ret){
                    if(err) done(err);
                    var data = {};
                    data.waitForSync = true;
                    data.isSystem = true;
                    data.isVolatile = false;
                    db.collection.setProperties(ret.id, data,function(err,ret){
                        done(err);
                    });
                });
            })
		})
	})

})


