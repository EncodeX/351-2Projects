class ShapeBuilder {
    static makeGroundGrid() {
        var xcount = 500;
        var ycount = 500;
        var xymax = 1500.0;
        var xColr = new Float32Array([0.9, 0.9, 0.9]);
        var yColr = new Float32Array([0.9, 0.9, 0.9]);
        var gndVerts = new Float32Array(9 * 2 * (xcount + ycount));

        var xgap = xymax / (xcount - 1);
        var ygap = xymax / (ycount - 1);

        var counter = 0;
        var gndIndices = new Uint16Array(xcount * 2 + ycount * 2);

        var v;
        var j;
        for (v = 0, j = 0; v < 2 * xcount; v++, j += 9) {
            if (v % 2 == 0) {
                gndVerts[j] = -xymax + (v) * xgap;
                gndVerts[j + 1] = -xymax;
                gndVerts[j + 2] = 0.0;
                // gndVerts[j + 3] = 1.0;
            } else {
                gndVerts[j] = -xymax + (v - 1) * xgap;
                gndVerts[j + 1] = xymax;
                gndVerts[j + 2] = 0.0;
                // gndVerts[j + 3] = 1.0;
            }
            gndVerts[j + 3] = xColr[0];
            gndVerts[j + 4] = xColr[1];
            gndVerts[j + 5] = xColr[2];

            gndVerts[j + 6] = 0.0;
            gndVerts[j + 7] = 0.0;
            gndVerts[j + 8] = 1.0;

            gndIndices[counter] = counter;
            counter = counter + 1;
        }
        for (v = 0; v < 2 * ycount; v++, j += 9) {
            if (v % 2 == 0) {
                gndVerts[j] = -xymax;
                gndVerts[j + 1] = -xymax + (v) * ygap;
                gndVerts[j + 2] = 0.0;
                // gndVerts[j + 3] = 1.0;
            } else {
                gndVerts[j] = xymax;
                gndVerts[j + 1] = -xymax + (v - 1) * ygap;
                gndVerts[j + 2] = 0.0;
                // gndVerts[j + 3] = 1.0;
            }
            gndVerts[j + 3] = yColr[0];
            gndVerts[j + 4] = yColr[1];
            gndVerts[j + 5] = yColr[2];

            gndVerts[j + 6] = 0.0;
            gndVerts[j + 7] = 0.0;
            gndVerts[j + 8] = 1.0;

            gndIndices[counter] = counter;
            counter = counter + 1;
        }

        return {
            verts: gndVerts,
            indices: gndIndices
        };
    }

    static makeCube(color) {
        //==============================================================================
        // Create a cube
        //    v6----- v5
        //   /|      /|
        //  v1------v0|
        //  | |     | |
        //  | |v7---|-|v4
        //  |/      |/
        //  v2------v3
        var sq3 = Math.sqrt(3);

        var cubeVerts = new Float32Array([
            // Vertex coordinates and color
            1.0, 1.0, 1.0,
            color.r, color.g, color.b, // v0 White
            sq3, sq3, sq3,
            -1.0, 1.0, 1.0,
            color.r, color.g, color.b, // v1 Magenta
            -sq3, sq3, sq3,
            -1.0, -1.0, 1.0,
            color.r, color.g, color.b, // v2 Red
            -sq3, -sq3, sq3,
            1.0, -1.0, 1.0,
            color.r, color.g, color.b, // v3 Yellow
            sq3, -sq3, sq3,
            1.0, -1.0, -1.0,
            color.r, color.g, color.b, // v4 Green
            sq3, -sq3, -sq3,
            1.0, 1.0, -1.0,
            color.r, color.g, color.b, // v5 Cyan
            sq3, sq3, -sq3,
            -1.0, 1.0, -1.0,
            color.r, color.g, color.b, // v6 Blue
            -sq3, sq3, -sq3,
            -1.0, -1.0, -1.0,
            color.r, color.g, color.b, // v7 Black
            -sq3, -sq3, -sq3,
        ]);

        // Indices of the vertices
        var cubeIndices = new Uint16Array([
            0, 1, 2, 0, 2, 3, // front
            0, 3, 4, 0, 4, 5, // right
            0, 5, 6, 0, 6, 1, // up
            1, 6, 7, 1, 7, 2, // left
            7, 4, 3, 7, 3, 2, // down
            4, 7, 6, 4, 6, 5 // back
        ]);

        return {
            verts: cubeVerts,
            indices: cubeIndices
        };
    }

    static makeSphere(div, color) {
        var i, ai, si, ci;
        var j, aj, sj, cj;
        var p1, p2;

        var positions = [];
        var indices = [];

        // Generate coordinates
        for (j = 0; j <= div; j++) {
            // 计算大圆平面的点坐标 (xy平面)
            aj = j * Math.PI / div;
            sj = Math.sin(aj);
            cj = Math.cos(aj);
            for (i = 0; i <= div; i++) {
                // 计算该大圆在xz平面的点坐标
                ai = i * 2 * Math.PI / div;
                si = Math.sin(ai);
                ci = Math.cos(ai);

                positions.push(si * sj); // X
                positions.push(cj); // Y
                positions.push(ci * sj); // Z
                // positions.push(1);

                positions.push(color[0]);
                positions.push(color[1]);
                positions.push(color[2]);

                positions.push(si * sj); // X
                positions.push(cj); // Y
                positions.push(ci * sj); // Z
            }
        }

        // Generate indices
        for (j = 0; j < div; j++) {
            for (i = 0; i < div; i++) {
                p1 = j * (div + 1) + i;
                p2 = p1 + (div + 1);

                indices.push(p1);
                indices.push(p2);
                indices.push(p1 + 1);

                indices.push(p1 + 1);
                indices.push(p2);
                indices.push(p2 + 1);
            }
        }

        return {
            verts: positions,
            indices: indices
        };
    }

    static makeTorus(color, rbend, rbar) {
        //==============================================================================
        // 		Create a torus centered at the origin that circles the z axis.
        // Terminology: imagine a torus as a flexible, cylinder-shaped bar or rod bent
        // into a circle around the z-axis. The bent bar's centerline forms a circle
        // entirely in the z=0 plane, centered at the origin, with radius 'rbend'.  The
        // bent-bar circle begins at (rbend,0,0), increases in +y direction to circle
        // around the z-axis in counter-clockwise (CCW) direction, consistent with our
        // right-handed coordinate system.
        // 		This bent bar forms a torus because the bar itself has a circular cross-
        // section with radius 'rbar' and angle 'phi'. We measure phi in CCW direction
        // around the bar's centerline, circling right-handed along the direction
        // forward from the bar's start at theta=0 towards its end at theta=2PI.
        // 		THUS theta=0, phi=0 selects the torus surface point (rbend+rbar,0,0);
        // a slight increase in phi moves that point in -z direction and a slight
        // increase in theta moves that point in the +y direction.
        // To construct the torus, begin with the circle at the start of the bar:
        //					xc = rbend + rbar*cos(phi);
        //					yc = 0;
        //					zc = -rbar*sin(phi);			(note negative sin(); right-handed phi)
        // and then rotate this circle around the z-axis by angle theta:
        //					x = xc*cos(theta) - yc*sin(theta)
        //					y = xc*sin(theta) + yc*cos(theta)
        //					z = zc
        // Simplify: yc==0, so
        //					x = (rbend + rbar*cos(phi))*cos(theta)
        //					y = (rbend + rbar*cos(phi))*sin(theta)
        //					z = -rbar*sin(phi)
        // To construct a torus from a single triangle-strip, make a 'stepped spiral' along the length of the bent bar; successive rings of constant-theta, using the same design used for cylinder walls in 'makeCyl()' and for 'slices' in makeSphere().  Unlike the cylinder and sphere, we have no 'special case' for the first and last of these bar-encircling rings.
        //
        var floatsPerVertex = 9;
        // var rbend = 1.0; // Radius of circle formed by torus' bent bar
        // var rbar = 0.5; // radius of the bar we bent to form torus
        var barSlices = 23; // # of bar-segments in the torus: >=3 req'd;
        // more segments for more-circular torus
        var barSides = 13; // # of sides of the bar (and thus the
        // number of vertices in its cross-section)
        // >=3 req'd;
        // more sides for more-circular cross-section
        // for nice-looking torus with approx square facets,
        //			--choose odd or prime#  for barSides, and
        //			--choose pdd or prime# for barSlices of approx. barSides *(rbend/rbar)
        // EXAMPLE: rbend = 1, rbar = 0.5, barSlices =23, barSides = 11.

        // Create a (global) array to hold this torus's vertices:
        var torVerts = new Float32Array(floatsPerVertex * (2 * barSides * barSlices + 2));
        var torIndices = [];
        //	Each slice requires 2*barSides vertices, but 1st slice will skip its first
        // triangle and last slice will skip its last triangle. To 'close' the torus,
        // repeat the first 2 vertices at the end of the triangle-strip.  Assume 7

        var phi = 0,
            theta = 0; // begin torus at angles 0,0
        var thetaStep = 2 * Math.PI / barSlices; // theta angle between each bar segment
        var phiHalfStep = Math.PI / barSides; // half-phi angle between each side of bar
        // (WHY HALF? 2 vertices per step in phi)
        // s counts slices of the bar; v counts vertices within one slice; j counts
        // array elements (Float32) (vertices*#attribs/vertex) put in torVerts array.
        let k = 0, s = 0, j = 0;
        for (s = 0, j = 0; s < barSlices; s++) { // for each 'slice' or 'ring' of the torus:
            for (let v = 0; v < 2 * barSides; v++, j += floatsPerVertex) { // for each vertex in this slice:
                if (v % 2 == 0) { // even #'d vertices at bottom of slice,
                    torVerts[j] = (rbend + rbar * Math.cos((v) * phiHalfStep)) *
                        Math.cos((s) * thetaStep);
                    //	x = (rbend + rbar*cos(phi)) * cos(theta)
                    torVerts[j + 1] = (rbend + rbar * Math.cos((v) * phiHalfStep)) *
                        Math.sin((s) * thetaStep);
                    //  y = (rbend + rbar*cos(phi)) * sin(theta)
                    torVerts[j + 2] = -rbar * Math.sin((v) * phiHalfStep);
                    //  z = -rbar  *   sin(phi)
                    // torVerts[j + 3] = 1.0; // w

                    // normals
                    torVerts[j + 6] = -(rbend + rbar * Math.cos((v) * phiHalfStep)) *
                        Math.cos((s) * thetaStep);
                    torVerts[j + 7] = -(rbend + rbar * Math.cos((v) * phiHalfStep)) *
                        Math.sin((s) * thetaStep);
                    torVerts[j + 8] = rbar * Math.sin((v) * phiHalfStep);
                } else { // odd #'d vertices at top of slice (s+1);
                    // at same phi used at bottom of slice (v-1)
                    torVerts[j] = (rbend + rbar * Math.cos((v - 1) * phiHalfStep)) *
                        Math.cos((s + 1) * thetaStep);
                    //	x = (rbend + rbar*cos(phi)) * cos(theta)
                    torVerts[j + 1] = (rbend + rbar * Math.cos((v - 1) * phiHalfStep)) *
                        Math.sin((s + 1) * thetaStep);
                    //  y = (rbend + rbar*cos(phi)) * sin(theta)
                    torVerts[j + 2] = -rbar * Math.sin((v - 1) * phiHalfStep);
                    //  z = -rbar  *   sin(phi)
                    // torVerts[j + 3] = 1.0; // w
                    // normals
                    torVerts[j + 6] = -(rbend + rbar * Math.cos((v - 1) * phiHalfStep)) *
                        Math.cos((s + 1) * thetaStep);
                    torVerts[j + 7] = -(rbend + rbar * Math.cos((v - 1) * phiHalfStep)) *
                        Math.sin((s + 1) * thetaStep);
                    torVerts[j + 8] = rbar * Math.sin((v - 1) * phiHalfStep);
                }
                torVerts[j + 3] = color[0]; // random color 0.0 <= R < 1.0
                torVerts[j + 4] = color[1]; // random color 0.0 <= G < 1.0
                torVerts[j + 5] = color[2]; // random color 0.0 <= B < 1.0
            }
        }
        // Repeat the 1st 2 vertices of the triangle strip to complete the torus:
        torVerts[j] = rbend + rbar; // copy vertex zero;
        //	x = (rbend + rbar*cos(phi==0)) * cos(theta==0)
        torVerts[j + 1] = 0.0;
        //  y = (rbend + rbar*cos(phi==0)) * sin(theta==0)
        torVerts[j + 2] = 0.0;
        //  z = -rbar  *   sin(phi==0)
        // torVerts[j + 3] = 1.0; // w
        torVerts[j + 3] = color[0]; // random color 0.0 <= R < 1.0
        torVerts[j + 4] = color[1]; // random color 0.0 <= G < 1.0
        torVerts[j + 5] = color[2]; // random color 0.0 <= B < 1.0
        torVerts[j + 6] = -rbend + rbar;
        torVerts[j + 7] = 0.0;
        torVerts[j + 8] = 0.0;
        j += floatsPerVertex; // go to next vertex:
        torVerts[j] = (rbend + rbar) * Math.cos(thetaStep);
        //	x = (rbend + rbar*cos(phi==0)) * cos(theta==thetaStep)
        torVerts[j + 1] = (rbend + rbar) * Math.sin(thetaStep);
        //  y = (rbend + rbar*cos(phi==0)) * sin(theta==thetaStep)
        torVerts[j + 2] = 0.0;
        //  z = -rbar  *   sin(phi==0)
        // torVerts[j + 3] = 1.0; // w
        torVerts[j + 3] = color[0]; // random color 0.0 <= R < 1.0
        torVerts[j + 4] = color[1]; // random color 0.0 <= G < 1.0
        torVerts[j + 5] = color[2]; // random color 0.0 <= B < 1.0
        torVerts[j + 6] = -(rbend + rbar) * Math.cos(thetaStep);
        torVerts[j + 7] = -(rbend + rbar) * Math.sin(thetaStep);
        torVerts[j + 8] = 0.0;

        return torVerts;
    }

    static makeCylinder(color, botRadius) {
    //==============================================================================
    // Make a cylinder shape from one TRIANGLE_STRIP drawing primitive, using the
    // 'stepped spiral' design described in notes.
    // Cylinder center at origin, encircles z axis, radius 1, top/bottom at z= +/-1.
    //
     // var ctrColr = new Float32Array([0.2, 0.2, 0.2]);	// dark gray
     // var topColr = new Float32Array([0.4, 0.7, 0.4]);	// light green
     // var botColr = new Float32Array([0.5, 0.5, 1.0]);	// light blue
     var floatsPerVertex = 9;
     var capVerts = 16;	// # of vertices around the topmost 'cap' of the shape
     // var botRadius = 1.6;		// radius of bottom of cylinder (top always 1.0)

     // Create a (global) array to hold this cylinder's vertices;
     var cylVerts = new Float32Array(  ((capVerts*6) -2) * floatsPerVertex);
    										// # of vertices * # of elements needed to store them.

    	// Create circle-shaped top cap of cylinder at z=+1.0, radius 1.0
    	// v counts vertices: j counts array elements (vertices * elements per vertex)
      let v, j;
    	for(v=1,j=0; v<2*capVerts; v++,j+=floatsPerVertex) {
    		// skip the first vertex--not needed.
    		if(v%2==0)
    		{				// put even# vertices at center of cylinder's top cap:
    			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,1,1
    			cylVerts[j+1] = 0.0;
    			cylVerts[j+2] = 1.0;
    			// cylVerts[j+3] = 1.0;			// r,g,b = topColr[]
    			cylVerts[j+3]=color[0];
    			cylVerts[j+4]=color[1];
    			cylVerts[j+5]=color[2];
    			cylVerts[j+6] = 0.0; 			// x,y,z,w == 0,0,1,1
    			cylVerts[j+7] = 0.0;
    			cylVerts[j+8] = -1.0;
    		}
    		else { 	// put odd# vertices around the top cap's outer edge;
    						// x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
    						// 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
    			cylVerts[j  ] = Math.cos(Math.PI*(v-1)/capVerts);			// x
    			cylVerts[j+1] = Math.sin(Math.PI*(v-1)/capVerts);			// y
    			//	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
    			//	 can simplify cos(2*PI * (v-1)/(2*capVerts))
    			cylVerts[j+2] = 1.0;	// z
    			// cylVerts[j+3] = 1.0;	// w.
    			// r,g,b = topColr[]
    			cylVerts[j+3]=color[0];
    			cylVerts[j+4]=color[1];
    			cylVerts[j+5]=color[2];
          cylVerts[j+6] = -Math.cos(Math.PI*(v-1)/capVerts);			// x
          cylVerts[j+7] = -Math.sin(Math.PI*(v-1)/capVerts);			// y
          //	(Why not 2*PI? because 0 < =v < 2*capVerts, so we
          //	 can simplify cos(2*PI * (v-1)/(2*capVerts))
          cylVerts[j+8] = -1.0;	// z
    		}
    	}
    	// Create the cylinder side walls, made of 2*capVerts vertices.
    	// v counts vertices within the wall; j continues to count array elements
    	for(v=0; v< 2*capVerts; v++, j+=floatsPerVertex) {
    		if(v%2==0)	// position all even# vertices along top cap:
    		{
    				cylVerts[j  ] = Math.cos(Math.PI*(v)/capVerts);		// x
    				cylVerts[j+1] = Math.sin(Math.PI*(v)/capVerts);		// y
    				cylVerts[j+2] = 1.0;	// z
    				// cylVerts[j+3] = 1.0;	// w.
    				// r,g,b = topColr[]
    				cylVerts[j+3]=color[0];
    				cylVerts[j+4]=color[1];
    				cylVerts[j+5]=color[2];
            cylVerts[j+6] = -Math.cos(Math.PI*(v)/capVerts);		// x
    				cylVerts[j+7] = -Math.sin(Math.PI*(v)/capVerts);		// y
    				cylVerts[j+8] = -1.0;	// z
    		}
    		else		// position all odd# vertices along the bottom cap:
    		{
    				cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
    				cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
    				cylVerts[j+2] =-1.0;	// z
    				// cylVerts[j+3] = 1.0;	// w.
    				// r,g,b = topColr[]
    				cylVerts[j+3]=color[0];
    				cylVerts[j+4]=color[1];
    				cylVerts[j+5]=color[2];
            cylVerts[j+6] = -botRadius * Math.cos(Math.PI*(v-1)/capVerts);		// x
    				cylVerts[j+7] = -botRadius * Math.sin(Math.PI*(v-1)/capVerts);		// y
    				cylVerts[j+8] = 1.0;	// z
    		}
    	}
    	// Create the cylinder bottom cap, made of 2*capVerts -1 vertices.
    	// v counts the vertices in the cap; j continues to count array elements
    	for(v=0; v < (2*capVerts -1); v++, j+= floatsPerVertex) {
    		if(v%2==0) {	// position even #'d vertices around bot cap's outer edge
    			cylVerts[j  ] = botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
    			cylVerts[j+1] = botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
    			cylVerts[j+2] =-1.0;	// z
    			// cylVerts[j+3] = 1.0;	// w.
    			// r,g,b = topColr[]
    			cylVerts[j+3]=color[0];
    			cylVerts[j+4]=color[1];
    			cylVerts[j+5]=color[2];
    			cylVerts[j+6] = -botRadius * Math.cos(Math.PI*(v)/capVerts);		// x
    			cylVerts[j+7] = -botRadius * Math.sin(Math.PI*(v)/capVerts);		// y
    			cylVerts[j+8] = 1.0;	// z
    		}
    		else {				// position odd#'d vertices at center of the bottom cap:
    			cylVerts[j  ] = 0.0; 			// x,y,z,w == 0,0,-1,1
    			cylVerts[j+1] = 0.0;
    			cylVerts[j+2] =-1.0;
    			// cylVerts[j+3] = 1.0;			// r,g,b = botColr[]
    			cylVerts[j+3]=color[0];
    			cylVerts[j+4]=color[1];
    			cylVerts[j+5]=color[2];
          cylVerts[j+6] = 0.0; 			// x,y,z,w == 0,0,-1,1
    			cylVerts[j+7] = 0.0;
    			cylVerts[j+8] = 1.0;
    		}
    	}

      return cylVerts;
    }

    static makeParticles(count){
      let partVerts = new Float32Array(count * 9);
      for(let i = 0; i < count; i ++){
        partVerts[i * 9 + 0] = Math.random() * 4.0 - 2.0;
        partVerts[i * 9 + 1] = Math.random() * 4.0 - 2.0;
        partVerts[i * 9 + 2] = Math.random() - 0.5;
        // partVerts[i * 9 + 3] = 1.0;
        partVerts[i * 9 + 3] = Math.random();
        partVerts[i * 9 + 4] = Math.random();
        partVerts[i * 9 + 5] = 1.0;
        partVerts[i * 9 + 6] = 1.0;
        partVerts[i * 9 + 7] = 1.0;
        partVerts[i * 9 + 8] = 1.0;
      }
      return partVerts;
    }
}
