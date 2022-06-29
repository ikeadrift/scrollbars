function findContentEdges(containerNode: FrameNode, childrenArray){
    const containerWidth = containerNode.width;
    const containerHeight = containerNode.height;

    let contentX1 = containerNode.children[0].x;
    let contentX2 = contentX1 + containerNode.children[0].width;

    let contentY1 = containerNode.children[0].y;
    let contentY2 = contentY1 + containerNode.children[0].height;

    childrenArray.forEach(function(child: SceneNode) {
        let childrenX1 = child.x;
        let childrenX2 = childrenX1 + child.width;
        if (childrenX1 < contentX1) {
            contentX1 = childrenX1;
        }
        if (childrenX2 > contentX2) {
            contentX2 = childrenX2;
        }
    })

    childrenArray.forEach(function(child: SceneNode) {
        let childrenY1 = child.y;
        let childrenY2 = childrenY1 + child.height;
        if (childrenY1 < contentY1) {
            contentY1 = childrenY1;
        }
        if (childrenY2 > contentY2) {
            contentY2 = childrenY2;
        }
    })

    if (containerNode.layoutMode === "HORIZONTAL" || containerNode.layoutMode === "VERTICAL") {
        if (contentY1 >= 0) {
            contentY1 = 0
        } else {
            contentY1 = contentY1 - containerNode.paddingTop;
        }
        if (contentY2 <= containerHeight) {
            contentY2 = containerHeight;
        } else {
            contentY2 = contentY2 + containerNode.paddingBottom;
        }
        if (contentX1 >= 0) {
            contentX1 = 0;
        } else {
            contentX1 = contentX1 - containerNode.paddingLeft;
        }
        if (contentX2 <= containerWidth) {
            contentX2 = containerWidth;
        } else {
            contentX2 = contentX2 + containerNode.paddingRight;
        }
    } else {
        if (contentY1 >= 0) {
            contentY1 = 0;
        }
        if (contentY2 <= containerHeight) {
            contentY2 = containerHeight;
        }
        if (contentX1 >= 0) {
            contentX1 = 0;
        }
        if (contentX2 <= containerWidth) {
            contentX2 = containerWidth;
        }
    }
    return {
        'x1': contentX1,
        'x2': contentX2 - containerWidth,
        'y1': contentY1,
        'y2': contentY2 - containerHeight
    }
}

function addScrollbar(containerNode, direction, offset: number, size: number) {
    const scrollbarFrame = figma.createFrame();
    scrollbarFrame.name = "Scrollbar Frame";
    scrollbarFrame.setPluginData("pluginscrollbar", "true");
    scrollbarFrame.fills = [];
    scrollbarFrame.expanded = false;

    const scrollbarBar = figma.createRectangle();
    scrollbarBar.cornerRadius = 3.5;
    scrollbarBar.name = "Scrollbar";
    scrollbarBar.fills = [{ type: 'SOLID', opacity: 0.5025, color: { r: 0, g: 0, b: 0 } }];
    scrollbarBar.strokes = [{ type: 'SOLID', opacity: 0.1475, color: { r: 1, g: 1, b: 1 } }];
    scrollbarBar.strokeAlign = 'OUTSIDE';
    scrollbarBar.strokeWeight = 1;

    containerNode.appendChild(scrollbarFrame);
    scrollbarFrame.appendChild(scrollbarBar);
    if (containerNode.layoutMode == "HORIZONTAL" || containerNode.layoutMode == "VERTICAL") {
        scrollbarFrame.layoutPositioning = "ABSOLUTE";
    }
    
    if (direction === "HORIZONTAL") {
        scrollbarFrame.constraints = {horizontal: "STRETCH", vertical: "MAX"};
        scrollbarFrame.resize(containerNode.width, 11);
        scrollbarFrame.x = 0;
        scrollbarFrame.y = containerNode.height - 11;
        scrollbarBar.resize(size, 7);
        scrollbarBar.x = offset;
        scrollbarBar.y = 2;
    } else if (direction === "VERTICAL"){
        scrollbarFrame.constraints = {horizontal: "MAX", vertical: "STRETCH"};
        scrollbarFrame.resize(11, containerNode.height);
        scrollbarFrame.x = containerNode.width - 11;
        scrollbarFrame.y = 0;
        scrollbarBar.resize(7, size);
        scrollbarBar.x = 2;
        scrollbarBar.y = offset;
    } else {
        figma.closePlugin("Error!")
    }
}

function calculateScrollbar(containerNode: FrameNode, x1: number, x2: number, y1: number, y2: number) {
    let scrollbarLength = 0;
    let scrollbarOffset = 0;
    const containerWidth = containerNode.width;
    const containerHeight = containerNode.height;
    const contentWidth = x2 - x1 + containerWidth;
    const contentHeight = y2 - y1 + containerHeight;

    if ( (contentHeight <= containerHeight) && (contentWidth <= containerWidth) ) {
        figma.closePlugin("No scrollbars needed.");
    }

    if (contentWidth > containerWidth) {
        scrollbarLength = Math.round((containerWidth / contentWidth) * (containerWidth - 4));
        scrollbarOffset = Math.round((Math.abs(x1) / contentWidth) * (containerWidth - 4)) + 2;
        if (containerNode.layoutMode == "HORIZONTAL") {

        }
        addScrollbar(containerNode, "HORIZONTAL", scrollbarOffset, scrollbarLength);
    }
    if (contentHeight > containerHeight) {
        scrollbarLength = Math.round((containerHeight / contentHeight) * (containerHeight - 4))
        scrollbarOffset = Math.round((Math.abs(y1) / contentHeight) * (containerHeight - 4)) + 2;
        addScrollbar(containerNode, "VERTICAL", scrollbarOffset, scrollbarLength);
    }
}

function removeNode(node) {
    if (node.id == "pluginscrollbar") {
        node.remove();
    }
}

function checkNodeEligibility() {
    if (figma.currentPage.selection.length === 0) {
        figma.closePlugin("Please select a frame.");
    }
    for (const node of figma.currentPage.selection) {
        if (node.type == "FRAME") {
            if (node.children.length !== 0) {
                node.findChildren(n => n.getPluginData("pluginscrollbar") === "true").forEach(n => n.remove());
                const {x1, x2, y1, y2} = findContentEdges(node, node.children);
                    calculateScrollbar(node, x1, x2, y1, y2);
                    figma.currentPage.selection = figma.currentPage.selection;
                    node.setRelaunchData({ ReapplyScrollbar: 'If your layout has changed.'});
                    figma.closePlugin("Scrollbars Calculated.");
            } else {
                figma.closePlugin("Please select a frame with children.");
            }
        } else {
            figma.closePlugin("Please select a frame.");
        }
    }
}

checkNodeEligibility();
