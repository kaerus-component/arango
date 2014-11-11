/*global require exports */
/**
 * The api module to perform a traversal on the edges of a start vertex.
 *
 * @module Arango
 * @submodule traversal
 * @class traversal
 * @extends Arango
 * 
 **/
function TraversalAPI(db) {
    var path = "/_api/traversal/";

    return {
	/**
	 *
	 * @param {String} startVertex     -  id of the startVertex, e.g. "users/foo".
	 * @param {String} edgeCollection  -  the edge collection containing the edges.
	 * @param {Object} options - a JSON Object contatining optional parameter:
	 * @param {String} [options.filter] -  body (JavaScript code) of custom filter function
	 * (signature (config, vertex, path) -> mixed) can return four different string values: <br>- "exclude" -> this
	 * vertex will not be visited.<br>- "prune" -> the edges of this vertex will not be followed.<br>- "" or
	 * undefined -> visit the vertex and follow it's edges.<br>- Array -> containing any combination of the above.
	 * @param {Number} [options.minDepth]  -   visits only nodes in at least the given depth
	 * @param {Number} [options.maxDepth]  -   visits only nodes in at most the given depth
	 * @param {String} [options.visitor] - body (JavaScript) code of custom visitor function (signature: (config,
	 * result, vertex, path) -> void visitor). Function can do anything, but its return value is ignored. To populate
	 * a result, use the result variable by reference.
	 * @param {String} [options.direction] - direction for traversal.  if set, must be either "outbound", "inbound",
	 * or "any" , if not set, the expander attribute must be specified.
	 * @param {String} [options.init] - body (JavaScript) code of custom result initialisation function (signature
	 * (config, result) -> void)  initialise any values in result with what is required,
	 * @param {String} [options.expander]  - body (JavaScript) code of custom expander function must be set if
	 * direction attribute is not set. function (signature (config, vertex, path) -> array)  expander must return an
	 * array of the connections for vertex.Each connection is an object with the attributes edge and vertex
	 * @param {String} [options.strategy] - traversal strategy can be "depthfirst" or "breadthfirst"
	 * @param {String} [options.order] - traversal order can be "preorder" or "postorder"
	 * @param {String} [options.itemOrder] - item iteration order can be "forward" or "backward"
	 * @param {String} [options.uniqueness] - specifies uniqueness for vertices and edges visited if set, must be an
	 * object like this: "uniqueness": {"vertices": "none"|"global"|path", "edges": "none"|"global"|"path"}.
	 * @param {Number} [options.maxIterations] - Maximum number of iterations in each traversal. This number can be
	 * set to prevent endless loops in traversal of cyclic graphs. When a traversal performs as many iterations as
	 * the maxIterations value, the traversal will abort with an error. If maxIterations is not set, a
	 * server-defined value may be used.
	 * @method start
	 * @return{Promise}
	 */
	"start": function (startVertex, edgeCollection, options) {

	    options = options || {};
	    
	    options.startVertex = startVertex;
	    options.edgeCollection = edgeCollection;

	    return db.post(path, options);
	}
    };
}


exports.traversal = TraversalAPI;
