<script lang="ts">
  import { onMount, tick } from 'svelte';

  const measurePerformance = (): number => {
    return window.performance.now();
  };

  import { Canvas, Layer } from 'svelte-canvas';
  import type { RenderFunc, Node } from '../skill_tree_types';
  import {
    baseJewelRadius,
    calculateNodePos,
    distance,
    drawnGroups,
    drawnNodes,
    formatStats,
    inverseSprites,
    inverseSpritesActive,
    inverseTranslations,
    orbitAngleAt,
    skillTree,
    toCanvasCoords
  } from '../skill_tree';
  import type { Point } from '../skill_tree';
  import { calculator, data } from '../types';

  interface Props {
    clickNode: (node: Node) => void;
    circledNode: number | undefined;
    selectedJewel: number;
    selectedConqueror: string;
    seed: number;
    highlighted?: number[];
    disabled?: number[];
    highlightJewels?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    clickNode,
    circledNode,
    selectedJewel,
    selectedConqueror,
    seed,
    highlighted = [],
    disabled = [],
    highlightJewels = false,
    children
  }: Props = $props();

  const startGroups = [427, 320, 226, 227, 323, 422, 329];

  const titleFont = '25px Roboto Mono';
  const statsFont = '17px Roboto Mono';

  let scaling = $state(10);

  let offsetX = $state(0);
  let offsetY = $state(0);

  // Calculate jewel radius based on scaling
  // This is a constant value that scales with the zoom level
  const jewelRadius = $derived(baseJewelRadius / scaling);

  const drawScaling = 2.6;

  const spriteCache: Record<string, HTMLImageElement> = {};
  const spriteCacheActive: Record<string, HTMLImageElement> = {};
  const drawSprite = (
    context: CanvasRenderingContext2D,
    path: string,
    pos: Point,
    active = false,
    mirrored = false
  ) => {
    let sprite = active ? inverseSpritesActive[path] : inverseSprites[path];

    if (!sprite && active) {
      sprite = inverseSprites[path];
    }

    const spriteSheetUrl = sprite.filename;

    if (!(spriteSheetUrl in (active ? spriteCacheActive : spriteCache))) {
      (active ? spriteCacheActive : spriteCache)[spriteSheetUrl] = new Image();
      (active ? spriteCacheActive : spriteCache)[spriteSheetUrl].src = spriteSheetUrl;
    }

    const self = sprite.coords[path];

    const newWidth = (self.w / scaling) * drawScaling;
    const newHeight = (self.h / scaling) * drawScaling;

    const topLeftX = pos.x - newWidth / 2;
    const topLeftY = pos.y - newHeight / 2;

    let finalY = topLeftY;

    if (mirrored) {
      finalY = topLeftY - newHeight / 2;
    }

    context.drawImage(
      (active ? spriteCacheActive : spriteCache)[spriteSheetUrl],
      self.x,
      self.y,
      self.w,
      self.h,
      topLeftX,
      finalY,
      newWidth,
      newHeight
    );

    if (mirrored) {
      context.save();

      context.translate(topLeftX, topLeftY);
      context.rotate(Math.PI);

      context.drawImage(
        (active ? spriteCacheActive : spriteCache)[spriteSheetUrl],
        self.x,
        self.y,
        self.w,
        self.h,
        -newWidth,
        -(newHeight / 2),
        newWidth,
        -newHeight
      );

      context.restore();
    }
  };

  const wrapText = (text: string, context: CanvasRenderingContext2D, width: number): string[] => {
    const result = [];

    let currentWord = '';
    text.split(' ').forEach((word) => {
      if (context.measureText(currentWord + word).width < width) {
        currentWord += ' ' + word;
      } else {
        result.push(currentWord.trim());
        currentWord = word;
      }
    });

    if (currentWord.length > 0) {
      result.push(currentWord.trim());
    }

    return result;
  };

  let mousePos: Point = $state({
    x: Number.MIN_VALUE,
    y: Number.MIN_VALUE
  });

  let cursor = $state('unset');

  let hoveredNode: Node | undefined = $state(undefined);

  // Function to render the skill tree
  // This function is called by the Canvas component to render the skill tree
  const render: RenderFunc = $derived(({ context, width, height }: { context: CanvasRenderingContext2D; width: number; height: number }) => {

    const start = window.performance.now();

    context.clearRect(0, 0, width, height);

    context.fillStyle = '#080c11';
    context.fillRect(0, 0, width, height);

    const connected: Record<string, boolean> = {};

    //Need to convert keys to numbers because typescript converts all keys into strings
    Object.keys(drawnGroups).forEach((keyId) => {
      const groupId = parseInt(keyId)
      const group = drawnGroups[groupId];
      const groupPos = toCanvasCoords(group.x, group.y, offsetX, offsetY, scaling);

      const maxOrbit = Math.max(...group.orbits);
      if (startGroups.indexOf(groupId) >= 0) {
        // Do not draw starter nodes
      } else if (maxOrbit == 1) {
        drawSprite(context, 'PSGroupBackground1', groupPos, false);
      } else if (maxOrbit == 2) {
        drawSprite(context, 'PSGroupBackground2', groupPos, false);
      } else if (maxOrbit == 3 || group.orbits.length > 1) {
        drawSprite(context, 'PSGroupBackground3', groupPos, false, true);
        // drawMirror(context, $PSGroupBackground3, groupPos);
      }
    });

    Object.entries(drawnNodes).forEach(([keyId, node]) => {
      const nodeId = parseInt(keyId);

      if (!node) return;
      const angle = orbitAngleAt(node.orbit??0, node.orbitIndex??0);
      const rotatedPos = calculateNodePos(node, offsetX, offsetY, scaling);

      node.out?.forEach((o: string) => {
        const nodeOutId = parseInt(o);
        const targetNode = drawnNodes[nodeOutId];
        if (!targetNode) {
          return;
        }

        const min = Math.min(nodeOutId, nodeId);
        const max = Math.max(nodeOutId, nodeId);
        const joined = min + ':' + max;

        if (joined in connected) {
          return;
        }
        connected[joined] = true;

        if (!targetNode) return;

        // Do not draw connections to mastery nodes
        if (targetNode.isMastery) return;

        const targetAngle = orbitAngleAt(targetNode.orbit??0, targetNode.orbitIndex??0);
        const targetRotatedPos = calculateNodePos(targetNode, offsetX, offsetY, scaling);

        context.beginPath();

        if (node.group != targetNode.group || node.orbit != targetNode.orbit) {
          context.moveTo(rotatedPos.x, rotatedPos.y);
          context.lineTo(targetRotatedPos.x, targetRotatedPos.y);
        } else {
          let a = Math.PI / 180 - (Math.PI / 180) * angle;
          let b = Math.PI / 180 - (Math.PI / 180) * targetAngle;

          a -= Math.PI / 2;
          b -= Math.PI / 2;

          const diff = Math.abs(Math.max(a, b) - Math.min(a, b));

          const finalA = diff > Math.PI ? Math.max(a, b) : Math.min(a, b);
          const finalB = diff > Math.PI ? Math.min(a, b) : Math.max(a, b);

          if(!node.group) return;
          const group = drawnGroups[node.group];
          if (!group) return;
          const groupPos = toCanvasCoords(group.x, group.y, offsetX, offsetY, scaling);
          context.arc(groupPos.x, groupPos.y, skillTree.constants.orbitRadii[node.orbit??0] / scaling + 1, finalA, finalB);
        }

        context.lineWidth = 6 / scaling;
        context.strokeStyle = `#524518`;
        context.stroke();
      });
    });

    // Define circledNodePos if circledNode is set 
    // (setting to 0,0 to avoid needing to check for undefined; only used if circledNode is set)
    let circledNodePos: Point = { x: 0, y: 0 };
    if (circledNode) {
      circledNodePos = calculateNodePos(drawnNodes[circledNode], offsetX, offsetY, scaling);
      context.strokeStyle = '#ad2b2b';
    }

    let hoveredNodeActive = false;
    let newHoverNode: Node | undefined;

    Object.values(drawnNodes).forEach((node:Node) => {
      const rotatedPos = calculateNodePos(node, offsetX, offsetY, scaling);
      let touchDistance = 0;

      let active = false;
      if (circledNode) {
        if (distance(rotatedPos, circledNodePos) < jewelRadius) {
          active = true;
        }
      }

      if (node.skill&&disabled.indexOf(node.skill) >= 0) active = false;

      //Todo:Give default node image if invalid icon
      if (node.isKeystone) {
        touchDistance = 110;
        drawSprite(context, node.icon??"", rotatedPos, active);
        if (active) {
          drawSprite(context, 'KeystoneFrameAllocated', rotatedPos, false);
        } else {
          drawSprite(context, 'KeystoneFrameUnallocated', rotatedPos, false);
        }
      } else if (node.isNotable) {
        touchDistance = 70;
        drawSprite(context, node.icon??"", rotatedPos, active);
        if (active) {
          drawSprite(context, 'NotableFrameAllocated', rotatedPos, false);
        } else {
          drawSprite(context, 'NotableFrameUnallocated', rotatedPos, false);
        }
      } else if (node.isJewelSocket) {
        touchDistance = 70;
        if (node.expansionJewel) {
          if (active) {
            drawSprite(context, 'JewelSocketAltNormal', rotatedPos, false);
          } else {
            drawSprite(context, 'JewelSocketAltNormal', rotatedPos, false);
          }
        } else {
          if (active) {
            drawSprite(context, 'JewelFrameAllocated', rotatedPos, false);
          } else {
            drawSprite(context, 'JewelFrameUnallocated', rotatedPos, false);
          }
        }
      } else if (node.isMastery) {
        drawSprite(context, node.inactiveIcon??"", rotatedPos, active);
      } else {
        touchDistance = 50;
        drawSprite(context, node.icon??"", rotatedPos, active);
        if (active) {
          drawSprite(context, 'PSSkillFrameActive', rotatedPos, false);
        } else {
          drawSprite(context, 'PSSkillFrame', rotatedPos, false);
        }
      }

      // Create highlightGradient inside render function
      const highlightGradientCenterX = width / 2;
      const highlightGradientCenterY = height / 2;
      const highlightGradientInner = 90 / scaling;
      const highlightGradientOuter = 100 / scaling;
      let highlightGradient: CanvasGradient = context.createRadialGradient(
        highlightGradientCenterX,
        highlightGradientCenterY,
        highlightGradientInner,
        highlightGradientCenterX,
        highlightGradientCenterY,
        highlightGradientOuter
      );
      highlightGradient.addColorStop(0, '#8cf34c'); // bright green
      highlightGradient.addColorStop(1, '#00ff00'); // neon green

      if (highlighted.indexOf(node.skill??-1) >= 0 || (highlightJewels && node.isJewelSocket)) {
        // Use the precomputed bright green gradient for the highlight ring
        context.strokeStyle = highlightGradient;
        context.lineWidth = 3;
        context.beginPath();
        context.arc(rotatedPos.x, rotatedPos.y, (touchDistance + 30) / scaling, 0, Math.PI * 2);
        context.stroke();
      }      if (distance(rotatedPos, mousePos) < touchDistance / scaling) {
        newHoverNode = node;
        hoveredNodeActive = active;
        // console.log('Hovering over node:', node.skill, node.name, 'at distance:', distance(rotatedPos, mousePos), 'touchDistance:', touchDistance / scaling);
      }
    });

    hoveredNode = newHoverNode;

    if (circledNode) {
      context.strokeStyle = '#ad2b2b';
      context.lineWidth = 1;
      context.beginPath();
      context.arc(circledNodePos.x, circledNodePos.y, jewelRadius, 0, Math.PI * 2);
      context.stroke();
    }

    if (hoveredNode) {
      let nodeName = hoveredNode.name ?? 'Node name';
      let nodeStats: { text: string; special: boolean }[] = (hoveredNode.stats || []).map((s) => ({
        text: s,
        special: false
      }));

      if (!hoveredNode.isJewelSocket && hoveredNodeActive) {
        if (
          hoveredNode.skill !== undefined &&
          data?.TreeToPassive &&
          data.TreeToPassive[hoveredNode.skill] !== undefined &&
          seed &&
          selectedJewel &&
          selectedConqueror
        ) {
          // Saving the hovered node skill to avoid recalculating it
          // This is mainly for error handling because VS Code forgets that hoveredNode is valid within this block
          // and complains about hoveredNode.skill being possibly undefined
          const hoveredSkill = hoveredNode.skill;
          const treePassive = data.TreeToPassive[hoveredSkill];
          if (treePassive && treePassive.Index !== undefined) {
            const result = calculator.Calculate(treePassive.Index,seed,selectedJewel, selectedConqueror);
            if (result)
            {
              if ('AlternatePassiveSkill' in result && result.AlternatePassiveSkill) {
                nodeStats = [];
                nodeName = result.AlternatePassiveSkill.Name ?? 'Alternative Skill';

                if (result.AlternatePassiveSkill.StatsKeys) {
                  result.AlternatePassiveSkill.StatsKeys.forEach((statId: number, i: number) => {
                    const stat = data.GetStatByIndex(statId);
                    if (!stat) return;
                    const translation = inverseTranslations[stat.ID] || '';
                    if (translation && result.StatRolls && result.StatRolls[i] !== undefined) {
                      nodeStats.push({
                        text: formatStats(translation, result.StatRolls[i]) || stat.ID,
                        special: true
                      });
                    }
                    else
                      throw new Error(`Failed to translate ${nodeName}. Skill ID: ${hoveredSkill}, Stat ID: ${stat.ID}`);
                  });
                  if (result.AlternatePassiveAdditionInformations) {
                    result.AlternatePassiveAdditionInformations.forEach((info) => {
                      if (info.AlternatePassiveAddition && info.AlternatePassiveAddition.StatsKeys) {
                        info.AlternatePassiveAddition.StatsKeys.forEach((statId: number, i: number) => {
                          const stat = data.GetStatByIndex(statId);
                          if (!stat) return;
                          const translation = inverseTranslations[stat.ID] || '';
                          if (translation && info.StatRolls && info.StatRolls[i] !== undefined) {
                            nodeStats.push({text: formatStats(translation, info.StatRolls[i]) || stat.ID, special: true});
                          }
                          else
                            throw new Error(`Failed to translate ${nodeName} additional info for statID: ${stat.ID}, skillID: ${hoveredSkill}, statRoll: ${info.StatRolls ? info.StatRolls[i] : 'undefined'}`);
                        });
                      }
                    });
                  }
                }
              }
            }
            else
              throw new Error(`Failed to calculate ${nodeName}. Skill ID: ${hoveredSkill}, Seed: ${seed}, Selected Jewel: ${selectedJewel}, Selected Conqueror: ${selectedConqueror}`);
          }
        }
      }

      context.font = titleFont;
      const textMetrics = context.measureText(nodeName);

      const maxWidth = Math.max(textMetrics.width + 50, 600);

      context.font = statsFont;

      const allLines: {
        text: string;
        offset: number;
        special: boolean;
      }[] = [];

      const padding = 30;

      let offset = 85;

      if (nodeStats && nodeStats.length > 0) {
        nodeStats.forEach((stat) => {
          if (allLines.length > 0) {
            offset += 5;
          }

          stat.text.split('\n').forEach((line) => {
            if (allLines.length > 0) {
              offset += 10;
            }

            const lines = wrapText(line, context, maxWidth - padding);
            lines.forEach((l) => {
              allLines.push({
                text: l,
                offset,
                special: stat.special
              });
              offset += 20;
            });
          });
        });
      } else if (hoveredNode.isJewelSocket) {
        allLines.push({
          text: 'Click to select this socket',
          offset,
          special: true
        });

        offset += 20;
      }

      const titleHeight = 55;

      context.fillStyle = 'rgba(75,63,24,0.9)';
      context.fillRect(mousePos.x, mousePos.y, maxWidth, titleHeight);

      context.fillStyle = '#ffffff';
      context.font = titleFont;
      context.textAlign = 'center';
      context.fillText(nodeName, mousePos.x + maxWidth / 2, mousePos.y + 35);

      context.fillStyle = 'rgba(0,0,0,0.8)';
      context.fillRect(mousePos.x, mousePos.y + titleHeight, maxWidth, offset - titleHeight);

      context.font = statsFont;
      context.textAlign = 'left';
      allLines.forEach((l) => {
        if (l.special) {
          context.fillStyle = '#8cf34c';
        } else {
          context.fillStyle = '#ffffff';
        }

        context.fillText(l.text, mousePos.x + padding / 2, mousePos.y + l.offset);
      });
    }

    if (hoveredNode && hoveredNode.isJewelSocket) {
      cursor = 'pointer';
    } else {
      cursor = 'unset';
    }

    context.fillStyle = '#ffffff';
    context.textAlign = 'right';
    context.font = '12px Roboto Mono';

    const end = measurePerformance();

    context.fillText(`${(end - start).toFixed(1)}ms`, width - 5, 17);
  });

  let downX = 0;
  let downY = 0;

  let startX = 0;
  let startY = 0;

  let down = false;
  const mouseDown = (event: MouseEvent | CustomEvent) => {
    // If event is a CustomEvent, extract the native event from detail
    const e = (event instanceof MouseEvent) ? event : (event as CustomEvent).detail as MouseEvent;
    down = true;
    downX = e.offsetX;
    downY = e.offsetY;
    startX = offsetX;
    startY = offsetY;

    // Update mouse position first
    mousePos = {
      x: e.offsetX,
      y: e.offsetY
    };

    // Force a re-render to update hoveredNode before processing click
    // Check for node under mouse cursor manually
    let clickedNode: Node | undefined;
    Object.values(drawnNodes).forEach((node: Node) => {
      const rotatedPos = calculateNodePos(node, offsetX, offsetY, scaling);
      let touchDistance = 0;

      if (node.isKeystone) {
        touchDistance = 110;
      } else if (node.isNotable || node.isJewelSocket) {
        touchDistance = 70;
      } else {
        touchDistance = 50;
      }

      if (distance(rotatedPos, mousePos) < touchDistance / scaling) {
        clickedNode = node;
      }
    });

    console.log('Mouse clicked at:', mousePos, 'clickedNode:', clickedNode, 'hoveredNode:', hoveredNode);
    
    if (clickedNode) {
      console.log('Clicking node:', clickedNode.skill, clickedNode.name);
      clickNode(clickedNode);
    } else if (hoveredNode) {
      console.log('Fallback clicking hovered node:', hoveredNode.skill, hoveredNode.name);
      clickNode(hoveredNode);
    }
  };

  const mouseUp = (event: PointerEvent) => {
    if (event.type === 'pointerup') {
      down = false;
    }

    mousePos = {
      x: event.offsetX,
      y: event.offsetY
    };
  };
  const mouseMove = (event: MouseEvent) => {
    // Always update mouse position for hover detection
    mousePos = {
      x: event.offsetX,
      y: event.offsetY
    };

    if (down) {
      offsetX = startX - (downX - event.offsetX) * scaling;
      offsetY = startY - (downY - event.offsetY) * scaling;
    }
  };

  const onScroll = (event: CustomEvent | WheelEvent) => {
    // If event is a CustomEvent, extract the native event from detail
    const e = (event instanceof WheelEvent) ? event : (event as CustomEvent).detail as WheelEvent;
    if (e.deltaY > 0) {
      if (scaling < 30) {
        offsetX += e.offsetX;
        offsetY += e.offsetY;
      }
    } else {
      if (scaling > 3) {
        offsetX -= e.offsetX;
        offsetY -= e.offsetY;
      }
    }

    scaling = Math.min(30, Math.max(3, scaling + e.deltaY / 100));

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  let width = $state(0);
  let height = $state(0);
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
  };

  let initialized = $state(false);  $effect(() => {
    if (!initialized && skillTree) {
      initialized = true;
      offsetX = (skillTree.min_x || 0) + (window.innerWidth / 2) * scaling;
      offsetY = (skillTree.min_y || 0) + (window.innerHeight / 2) * scaling;
    }
  })

  onMount(() => {
    resize();
    (async () => {
      let _first = true;
      if (_first) {
        _first = false;
      } else {
        await tick();
        resize();
      }
    })();
  });
</script>

<svelte:window onpointerup={mouseUp} onpointermove={mouseMove} onresize={resize} />

{#if width && height}
  <div onresize={resize} style="touch-action: none; cursor: {cursor}">
    <Canvas {width} {height} on:pointerdown={mouseDown} on:wheel={onScroll}>
      <Layer {render} />
    </Canvas>
    {@render children?.()}
  </div>
{/if}
