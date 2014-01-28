/* 
* Copyright (c) 2012-2013 Kaerus (kaerus.com), Anders Elo <anders @ kaerus com>.
*/

var Arango = require('../arango');

var path = "/_api/traversal/";

var TraversalAPI = {
    /**
     *
     * @param startVertex       -  id of the startVertex, e.g. "users/foo".
     * @param edgeCollection    -  the edge collection containing the edges.
     * @param options           - a JSON Object containing parameter:
     *                                  - filter  body (JavaScript code) of custom filter function function signature:
     *                                    (config, vertex, path) -> mixed can return four different string values:
     *                                    - "exclude" -> this vertex will not be visited.
     *                                    - "prune" -> the edges of this vertex will not be followed.
     *                                    - "" or undefined -> visit the vertex and follow it's edges.
     *                                    - Array -> containing any combination of the above.
     *                                  - minDepth    visits only nodes in at least the given depth
     *                                  - maxDepth    visits only nodes in at most the given depth
     *                                  - visitor: body (JavaScript) code of custom visitor function function
     *                                      signature: (config, result, vertex, path) -> void visitor function can do
     *                                      anything, but its return value is ignored. To populate a result, use the
     *                                      result variable by reference.
     *                                  - direction: direction for traversal.  *if set*, must be either
     *                                      "outbound", "inbound", or "any" -
     *                                      *if not set*, the expander attribute must be specified.
     *                                  - init: body (JavaScript) code of custom result initialisation function function
     *                                      signature: (config, result) -> void initialise any values in result with what
     *                                      is required,
     *                                  - expander: body (JavaScript) code of custom expander function *must* be set if
     *                                      direction attribute is *not* set.  function signature: (config, vertex, path)
     *                                      -> array expander must return an array of the connections for vertex.
     *                                      each connection is an object with the attributes edge and vertex
     *                                  - strategy (optional): traversal strategy can be "depthfirst" or "breadthfirst"
     *                                  - order (optional): traversal order can be "preorder" or "postorder"
     *                                  - itemOrder (optional): item iteration order can be "forward" or "backward"
     *                                  - uniqueness (optional): specifies uniqueness for vertices and edges visited if
     *                                    set, must be an object like this: "uniqueness":
     *                                    {"vertices": "none"|"global"|path", "edges": "none"|"global"|"path"}
     *                                  - maxIterations (optional): Maximum number of iterations in each traversal. This
     *                                      number can be set to prevent endless loops in traversal of cyclic graphs. When
     *                                      a traversal performs as many iterations as the maxIterations value, the
     *                                      traversal will abort with an error. If maxIterations is not set, a server-
     *                                      defined value may be used.
     * @param callback
     * @returns {*}
     */
	"startTraversal": function(startVertex, edgeCollection, options, callback){

		if(typeof options === 'function'){
			callback = options;
			options = {};
		}
        options.edgeCollection = edgeCollection;
        options.startVertex = startVertex;

		return this.db.post(path,options,null,callback);
	}
};


module.exports = Arango.api('traversal',TraversalAPI);
