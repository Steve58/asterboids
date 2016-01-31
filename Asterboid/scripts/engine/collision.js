// collision
// Collision detection features

"use strict";

window.e58 = window.e58 || {};

e58.collision = {};

(function () {
    e58.collision.areBlocksInContact = function (blockA, blockB) {
        var i, j;

        if (blockA.frame.origin.getDistance(blockB.frame.origin) > blockA.rMax + blockB.rMax) {
            return false;
        }

        calculateCachedValues([blockA, blockB]);

        for (i = blockA.planes.length - 1; i >= 0; --i) {
            for (j = blockB.planes.length - 1; j >= 0; --j) {
                if (arePlanesInContact(blockA.planes[i], blockB.planes[j])
                        || arePlanesInContact(blockB.planes[j], blockA.planes[i])) {
                    clearCachedValues([blockA, blockB]);
                    return true;
                }
            }
        }

        clearCachedValues([blockA, blockB]);
        return false;
    };

    function calculateCachedValues(blocks) {
        blocks.forEach(function (block) {
            block.planes.forEach(function (plane) {
                plane.cachedUniversePoints = plane.getUniversePoints();
                plane.cachedPlaneFrame = getPlaneFrame(plane.cachedUniversePoints);
                plane.cachedPointsInPlaneFrame = getPlanePointsInPlaneFrame(plane);
            });
        });
    }

    function clearCachedValues(blocks) {
        blocks.forEach(function (block) {
            block.planes.forEach(function (plane) {
                plane.cachedUniversePoints = null;
                plane.cachedPlaneFrame = null;
                plane.cachedPointsInPlaneFrame = null;
            });
        });
    }

    // Gets a frame with all planePoints in x-y plane (z = 0)
    function getPlaneFrame(planePoints) {
        // Assume first three plane points are not in a line
        // Point 0 is the origin
        var planeFrame = e58.frame.getNew(planePoints[0], 0, 0, 0);

        var inFrame = function (point) {
            return point.getPointInFrame(planeFrame, /* sign: */ 1);
        };

        // Rotate for x axis along line from point 0 to point 1 in two steps
        planeFrame.rotateInOwnFrameZ(
                -s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(inFrame(planePoints[1]).y, inFrame(planePoints[1]).x))));


        planeFrame.rotateInOwnFrameY(
                -s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(inFrame(planePoints[1]).z, inFrame(planePoints[1]).x))));

        // Rotate for point 2 in x-y frame plane
        planeFrame.rotateInOwnFrameX(
                -s58.utils.radToDeg(s58.utils.radPiToPi(Math.atan2(inFrame(planePoints[2]).z, inFrame(planePoints[2]).y))));

        return planeFrame;
    }

    function getPlanePointsInPlaneFrame(plane) {
        var pointsInFrame = [];
        plane.cachedUniversePoints.forEach(function (point, i) {
            pointsInFrame.push(
                point.getPointInFrame(plane.cachedPlaneFrame, /* sign: */ -1));
        });
        return pointsInFrame;
    }

    function arePlanesInContact(linesPlane, planePlane) {
        var i;
        var nLines = linesPlane.cachedUniversePoints.length;
        for (i = nLines -1; i >= 0; i--) {
            if (doesLineHitPlane(
                    [linesPlane.cachedUniversePoints[i], linesPlane.cachedUniversePoints[(i + 1) % nLines]],
                    planePlane)) {
                return true;
            }
        }
        return false;
    }

    function doesLineHitPlane(linePoints, plane) {
        // TODO: handle line in plane case
        var intersectPointInPlaneFrame = getLineInfinitePlaneIntersect(linePoints, plane);

        return intersectPointInPlaneFrame ?
            isPointInLocus(intersectPointInPlaneFrame, plane.cachedPointsInPlaneFrame):
            false;
    }

    // Get the  intersect of the line and the x-y plane of the specified Plane's planeFrame, or null
    function getLineInfinitePlaneIntersect(linePoints, plane) {
        var linePointsInFrame = [
            linePoints[0].getPointInFrame(plane.cachedPlaneFrame, /* sign: */ -1),
            linePoints[1].getPointInFrame(plane.cachedPlaneFrame, /* sign: */ -1)];

        if (linePointsInFrame[0].z * linePointsInFrame[1].z >= 0
                || linePointsInFrame[1].z - linePointsInFrame[0].z == 0) {
            return null;
        }

        var intersectRatio = -linePointsInFrame[0].z / (linePointsInFrame[1].z - linePointsInFrame[0].z);

        return e58.point.getNewXYZ(
            linePointsInFrame[0].x + intersectRatio * (linePointsInFrame[1].x - linePointsInFrame[0].x),
            linePointsInFrame[0].y + intersectRatio * (linePointsInFrame[1].y - linePointsInFrame[0].y),
            linePointsInFrame[0].z + intersectRatio * (linePointsInFrame[1].z - linePointsInFrame[0].z));
    }

    // Is the point within the specified locus?
    // Assumed point and locusPoints all in x-y plane.
    function isPointInLocus(point, locusPoints) {
        // assume no concave sides to locus (plane)
        var i, bearingDifferenceRad;

        for (i = locusPoints.length - 1; i >= 0; --i) {
            locusPoints[i].bearingRad = (Math.atan2(locusPoints[i].x - point.x, locusPoints[i].y - point.y) + s58.THREEPI) % s58.TWOPI;
        }

        var bearingDifferenceRadSum = 0;
        for (i = locusPoints.length - 1; i >= 0; --i) {
            bearingDifferenceRad = Math.abs(locusPoints[i].bearingRad - locusPoints[(i + 1) % locusPoints.length].bearingRad);
            bearingDifferenceRadSum += bearingDifferenceRad <= s58.PI ?
                bearingDifferenceRad:
                s58.TWOPI - bearingDifferenceRad;
        }

        // console.log("isPointInLocus " + " x: " + point.x + " y: " + point.y + " bearingDifferenceRadSum: " + bearingDifferenceRadSum);
        return bearingDifferenceRadSum > s58.TWOPI - 0.01 && bearingDifferenceRadSum < s58.TWOPI + 0.01;
    }
})();
