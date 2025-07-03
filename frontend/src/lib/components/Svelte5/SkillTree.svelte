<!-- Modern SkillTree Component - Svelte 5 Compliant -->
<!-- Features: Runes ($state, $derived, $effect), TypeScript, Canvas rendering -->
<script lang="ts">
  const measurePerformance = (): number => {
    return window.performance.now();
  };

  // Svelte 5 compatible canvas library (or fallback to current)
  import { Canvas, Layer } from 'svelte-canvas';
  import type { RenderFunc, Node } from '../../skill_tree_types_modern';
  import { baseJewelRadius, calculateNodePos, distance, drawnGroups, drawnNodes, formatStats, inverseSprites, inverseSpritesActive, inverseTranslations, orbitAngleAt, skillTree, toCanvasCoords } from '../../skill_tree_modern';
  import type { Point } from '../../skill_tree_modern';
  import { useCalculator, useData } from '../../types/ModernTypes.svelte';

  // Modern state management using Svelte 5 runes
  let scaling = $state(10);
  let offsetX = $state(0);
  let offsetY = $state(0);

  // Get reactive calculator and data using modern hooks
  const calculator = useCalculator();
  const data = useData();
  const calculatorValue = $derived(calculator);
  const dataValue = $derived(data);

  // Derived values (Svelte 5 style)
  const jewelRadius = $derived(baseJewelRadius / scaling);

  // Modern prop definitions using Svelte 5 $props()
  interface Props {
    clickNode: (node: Node) => void;
    circledNode?: number | undefined;
    selectedJewel: number;
    selectedConqueror: string;
    seed: number;
    highlighted?: number[];
    disabled?: number[];
    highlightJewels?: boolean;
    children?: import('svelte').Snippet;
  }

  let { clickNode, circledNode = $bindable(undefined), selectedJewel, selectedConqueror, seed, highlighted = [], disabled = [], highlightJewels = false, children }: Props = $props();

  const startGroups = [427, 320, 226, 227, 323, 422, 329];
  const titleFont = '25px Roboto Mono';
  const statsFont = '17px Roboto Mono';
  const drawScaling = 2.6;

  const spriteCache: Record<string, HTMLImageElement> = {};
  const spriteCacheActive: Record<string, HTMLImageElement> = {};

  const drawSprite = (context: CanvasRenderingContext2D, path: string, pos: Point, active = false, mirrored = false) => {
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

    context.drawImage((active ? spriteCacheActive : spriteCache)[spriteSheetUrl], self.x, self.y, self.w, self.h, topLeftX, finalY, newWidth, newHeight);

    if (mirrored) {
      context.save();
      context.translate(topLeftX, topLeftY);
      context.rotate(Math.PI);
      context.drawImage((active ? spriteCacheActive : spriteCache)[spriteSheetUrl], self.x, self.y, self.w, self.h, -newWidth, -(newHeight / 2), newWidth, -newHeight);
      context.restore();
    }
  };
  const wrapText = (text: string, context: CanvasRenderingContext2D, width: number): string[] => {
    const result: string[] = [];
    let currentWord = '';

    text.split(' ').forEach((word: string) => {
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

  let mousePos: Point = {
    x: Number.MIN_VALUE,
    y: Number.MIN_VALUE
  };

  const cyclingGradiant = (context: CanvasRenderingContext2D, width: number, height: number, scaling: number): CanvasGradient => {
    const highlightGradientCenterX = width / 2;
    const highlightGradientCenterY = height / 2;
    const highlightGradientInner = 90 / scaling;
    const highlightGradientOuter = 100 / scaling;

    let highlightGradient: CanvasGradient = context.createRadialGradient(highlightGradientCenterX, highlightGradientCenterY, highlightGradientInner, highlightGradientCenterX, highlightGradientCenterY, highlightGradientOuter);
    highlightGradient.addColorStop(0, '#8cf34c'); // bright green
    highlightGradient.addColorStop(1, '#00ff00'); // neon green
    return highlightGradient;
  };
  let cursor = $state('unset');
  let hoveredNode = $state<Node | undefined>(undefined);
  // Derived render function (Svelte 5 style)
  const render: RenderFunc = $derived((({ context, width, height }) => {
    const start = measurePerformance();

    context.clearRect(0, 0, width, height);

    context.fillStyle = '#080c11';
    context.fillRect(0, 0, width, height);
    const connected: Record<string, boolean> = {};
    Object.keys(drawnGroups).forEach((groupId: string) => {
      const group = drawnGroups[groupId as any];
      const groupPos = toCanvasCoords(group.x, group.y, offsetX, offsetY, scaling);

      const maxOrbit = Math.max(...group.orbits);
      if (startGroups.indexOf(parseInt(groupId)) >= 0) {
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

    Object.keys(drawnNodes).forEach((nodeId: string) => {
      const node = drawnNodes[nodeId as any];
      if (!node.orbit || node.orbitIndex === undefined) return;

      const angle = orbitAngleAt(node.orbit, node.orbitIndex);
      const rotatedPos = calculateNodePos(node, offsetX, offsetY, scaling);

      node.out?.forEach((o: any) => {
        if (!drawnNodes[parseInt(o)]) {
          return;
        }

        const min = Math.min(parseInt(o), parseInt(nodeId));
        const max = Math.max(parseInt(o), parseInt(nodeId));
        const joined = min + ':' + max;

        if (joined in connected) {
          return;
        }
        connected[joined] = true;

        const targetNode = drawnNodes[parseInt(o)];
        if (!targetNode || !targetNode.orbit || targetNode.orbitIndex === undefined) {
          return;
        }

        // Do not draw connections to mastery nodes
        if (targetNode.isMastery) {
          return;
        }

        const targetAngle = orbitAngleAt(targetNode.orbit, targetNode.orbitIndex);
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

          if (node.group && node.orbit !== undefined) {
            const group = drawnGroups[node.group as any];
            const groupPos = toCanvasCoords(group.x, group.y, offsetX, offsetY, scaling);
            context.arc(groupPos.x, groupPos.y, skillTree.constants.orbitRadii[node.orbit] / scaling + 1, finalA, finalB);
          }
        }

        context.lineWidth = 6 / scaling;
        context.strokeStyle = `#524518`;
        context.stroke();
      });
    });
    let circledNodePos: Point | undefined;
    if (circledNode && drawnNodes[circledNode]) {
      circledNodePos = calculateNodePos(drawnNodes[circledNode], offsetX, offsetY, scaling);
      context.strokeStyle = '#ad2b2b';
    }

    let hoveredNodeActive = false;
    let newHoverNode: Node | undefined;
    Object.keys(drawnNodes).forEach((nodeId: string) => {
      const node = drawnNodes[nodeId as any];
      const rotatedPos = calculateNodePos(node, offsetX, offsetY, scaling);
      let touchDistance = 0;

      let active = false;
      if (circledNode && circledNodePos) {
        if (distance(rotatedPos, circledNodePos) < jewelRadius) {
          active = true;
        }
      }

      if (node.skill !== undefined && disabled.indexOf(node.skill) >= 0) {
        active = false;
      }

      if (node.isKeystone) {
        touchDistance = 110;
        if (node.icon) {
          drawSprite(context, node.icon, rotatedPos, active);
        }
        if (active) {
          drawSprite(context, 'KeystoneFrameAllocated', rotatedPos, false);
        } else {
          drawSprite(context, 'KeystoneFrameUnallocated', rotatedPos, false);
        }
      } else if (node.isNotable) {
        touchDistance = 70;
        if (node.icon) {
          drawSprite(context, node.icon, rotatedPos, active);
        }
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
        if (node.inactiveIcon) {
          drawSprite(context, node.inactiveIcon, rotatedPos, active);
        }
      } else {
        touchDistance = 50;
        if (node.icon) {
          drawSprite(context, node.icon, rotatedPos, active);
        }
        if (active) {
          drawSprite(context, 'PSSkillFrameActive', rotatedPos, false);
        } else {
          drawSprite(context, 'PSSkillFrame', rotatedPos, false);
        }
      }

      if ((node.skill !== undefined && highlighted.indexOf(node.skill) >= 0) || (highlightJewels && node.isJewelSocket)) {
        if ((!highlighted || !highlighted.length) && !highlightJewels) {
          context.strokeStyle = '#ffffff';
        } else {
          // Using cycling green color for visual effects or simple green color
          context.strokeStyle = cyclingGradiant(context, width, height, scaling) ?? '#00ff00';
        }
        context.lineWidth = 3;
        context.beginPath();
        context.arc(rotatedPos.x, rotatedPos.y, (touchDistance + 30) / scaling, 0, Math.PI * 2);
        context.stroke();
      }

      if (distance(rotatedPos, mousePos) < touchDistance / scaling) {
        newHoverNode = node;
        hoveredNodeActive = active;
        //console.log('Hovering over node:', node.skill, node.name, 'at distance:', distance(rotatedPos, mousePos), 'touchDistance:', touchDistance / scaling);
      }
    });

    hoveredNode = newHoverNode;

    if (circledNode) {
      context.strokeStyle = '#ad2b2b';
      context.lineWidth = 1;
      context.beginPath();
      if (circledNodePos) {
        context.arc(circledNodePos.x, circledNodePos.y, jewelRadius, 0, Math.PI * 2);
        context.stroke();
      }
    }

    if (hoveredNode) {
      let nodeName = hoveredNode.name;
      let nodeStats: { text: string; special: boolean }[] = (hoveredNode.stats || []).map(s => ({
        text: s,
        special: false
      }));
      if (!hoveredNode.isJewelSocket && hoveredNodeActive) {
        if (hoveredNode.skill && seed && selectedJewel && selectedConqueror && calculatorValue && dataValue) {
          try {
            const result = (calculatorValue as any).Calculate((dataValue as any).TreeToPassive[hoveredNode.skill].Index, seed, selectedJewel, selectedConqueror);

            if (result) {
              if ('AlternatePassiveSkill' in result && result.AlternatePassiveSkill) {
                nodeStats = [];
                nodeName = result.AlternatePassiveSkill.Name;

                if ('StatsKeys' in result.AlternatePassiveSkill) {
                  result.AlternatePassiveSkill.StatsKeys.forEach((statId: any, i: number) => {
                    const stat = (dataValue as any).GetStatByIndex(statId);
                    const translation = inverseTranslations[stat.ID] || '';
                    if (translation) {
                      nodeStats.push({
                        text: formatStats(translation, result.StatRolls[i]) || stat.ID,
                        special: true
                      });
                    }
                  });
                }
              }

              if (result.AlternatePassiveAdditionInformations) {
                result.AlternatePassiveAdditionInformations.forEach((info: any) => {
                  if ('StatsKeys' in info.AlternatePassiveAddition) {
                    info.AlternatePassiveAddition.StatsKeys.forEach((statId: any, i: number) => {
                      const stat = (dataValue as any).GetStatByIndex(statId);
                      const translation = inverseTranslations[stat.ID] || '';
                      if (translation) {
                        nodeStats.push({
                          text: formatStats(translation, info.StatRolls[i]) || stat.ID,
                          special: true
                        });
                      }
                    });
                  }
                });
              }
            }
          } catch (error) {
            console.warn('Error calculating node stats:', error);
          }
        }
      }
      context.font = titleFont;
      const textMetrics = context.measureText(nodeName || '');

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
        nodeStats.forEach(stat => {
          if (allLines.length > 0) {
            offset += 5;
          }

          stat.text.split('\n').forEach(line => {
            if (allLines.length > 0) {
              offset += 10;
            }

            const lines = wrapText(line, context, maxWidth - padding);
            lines.forEach(l => {
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
      context.fillText(nodeName || '', mousePos.x + maxWidth / 2, mousePos.y + 35);

      context.fillStyle = 'rgba(0,0,0,0.8)';
      context.fillRect(mousePos.x, mousePos.y + titleHeight, maxWidth, offset - titleHeight);

      context.font = statsFont;
      context.textAlign = 'left';
      allLines.forEach(l => {
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
  }) as RenderFunc);

  // Modern state management - Svelte 5 ready
  let downX = $state(0);
  let downY = $state(0);
  let startX = $state(0);
  let startY = $state(0);
  let down = $state(false);
  const mouseDown = (event: CustomEvent<MouseEvent>) => {
    const mouseEvent = event.detail;
    down = true;
    downX = mouseEvent.offsetX;
    downY = mouseEvent.offsetY;
    startX = offsetX;
    startY = offsetY;

    mousePos = {
      x: mouseEvent.offsetX,
      y: mouseEvent.offsetY
    };

    if (hoveredNode) {
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
    if (down) {
      offsetX = startX - (downX - event.offsetX) * scaling;
      offsetY = startY - (downY - event.offsetY) * scaling;
    }

    mousePos = {
      x: event.offsetX,
      y: event.offsetY
    };
  };

  const onScroll = (event: CustomEvent<WheelEvent>) => {
    const wheelEvent = event.detail;
    if (wheelEvent.deltaY > 0) {
      if (scaling < 30) {
        offsetX += wheelEvent.offsetX;
        offsetY += wheelEvent.offsetY;
      }
    } else {
      if (scaling > 3) {
        offsetX -= wheelEvent.offsetX;
        offsetY -= wheelEvent.offsetY;
      }
    }

    scaling = Math.min(30, Math.max(3, scaling + wheelEvent.deltaY / 100));

    wheelEvent.preventDefault();
    wheelEvent.stopPropagation();
    wheelEvent.stopImmediatePropagation();
  };
  let width = $state(0);
  let height = $state(0);

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
  };

  let initialized = $state(false);

  // Initialize offset position and window size when skill tree is available
  $effect(() => {
    if (!initialized && skillTree) {
      initialized = true;
      offsetX = skillTree.min_x + (window.innerWidth / 2) * scaling;
      offsetY = skillTree.min_y + (window.innerHeight / 2) * scaling;
    }
    resize();
  });
</script>

<!-- Modern event handling - Svelte 5 ready -->
<svelte:window on:pointerup={mouseUp} on:pointermove={mouseMove} on:resize={resize} />

{#if width && height}
  <div style="touch-action: none; cursor: {cursor}">
    <!-- Svelte 5 Ready Canvas -->
    <Canvas width={width} height={height} on:pointerdown={mouseDown} on:wheel={onScroll}>
      <Layer render={render} />
    </Canvas>
    {#if children}
      {@render children()}
    {/if}
  </div>
{/if}
