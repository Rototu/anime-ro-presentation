"use strict";

let GameModule = ( () => {

   let myMap = new Int8Array( 1152 );

   let $game = $( "#game" );
   let images = {};
   let npcs = [];

   let canvas = document.getElementById( "character-canvas" );
   let context = canvas.getContext( "2d" );
   context.imageSmoothingEnabled = false;
   context.mozImageSmoothingEnabled = false;

   let background = document.getElementById( "background-canvas" );
   let backgroundContext = background.getContext( "2d" );
   backgroundContext.imageSmoothingEnabled = false;
   backgroundContext.mozImageSmoothingEnabled = false;

   let foreground = document.getElementById( "foreground-canvas" );
   let foregroundContext = foreground.getContext( "2d" );
   foregroundContext.imageSmoothingEnabled = false;
   foregroundContext.mozImageSmoothingEnabled = false;

   let portrait = document.getElementById( "portrait-canvas" );
   let portraitContext = portrait.getContext( "2d" );
   portraitContext.imageSmoothingEnabled = false;
   portraitContext.mozImageSmoothingEnabled = false;

   let start = null;
   let shouldAnimate = false;
   let spriteAnimate = true;
   let pressedKey = 0;

   let playerX = 0;
   let playerY = 0;
   let currentLevel = 1;

   return {

      test: () => {

         GameModule.setLevelArrayPrototype();
         GameModule.arrayTo2DLevel( currentLevel );
         GameModule.getNpcs( currentLevel );

         GameModule.imageInsertion();

         GameModule.setCanvasBackground( images[ "background" + currentLevel ] );
         GameModule.setCanvasForeground( images[ "foreground" + currentLevel ] );

         GameModule.drawCanvasImageObj( images[ "miyazaki" ], 0, 0, foregroundContext );
         GameModule.setSpriteFrame( images[ "naruto" ] );

         playerX = 32;
         playerY = 160;

         GameModule.playerControls();
         GameModule.canvasMouseHandler();
         window.requestAnimationFrame( GameModule.timer );

      },

      init: () => {

      },

      imageInsertion: () => {

         GameModule.addCanvasImageObj( "background1", "img/game/levels/level1.png", 384, 768 );

         GameModule.addCanvasImageObj( "foreground1", "img/game/levels/level1Overlay.png", 384, 768 );

         GameModule.addCanvasImageObj( "naruto", "img/game/sprites/narutoS.png", 32, 21, 4 );
         GameModule.addCanvasImageObj( "miyazaki", "img/game/sprites/miyazaki.png", 32, 32 );
         GameModule.addCanvasImageObj( "miyazakiPortrait", "img/game/misc/miyazakiportrait.png", 200, 200 );

         GameModule.setCanvasImageObjPos( images[ "naruto" ], 32, 160 );
         GameModule.setCanvasImageObjPos( images[ "miyazaki" ], 416, 224 );

      },

      playerControls: () => {

         let player = images[ "naruto" ];

         $( document )
            .keydown( ( key ) => {

               if ( pressedKey == 0 && shouldAnimate == false ) {

                  switch ( key.which ) {

                  case 37:
                     GameModule.changeSpriteOrientation( player, "left" );
                     pressedKey = 37;
                     break;

                  case 38:
                     GameModule.changeSpriteOrientation( player, "up" );
                     pressedKey = 38;
                     break;

                  case 39:
                     GameModule.changeSpriteOrientation( player, "right" );
                     pressedKey = 39;
                     break;

                  case 40:
                     GameModule.changeSpriteOrientation( player, "down" );
                     pressedKey = 40;
                     break;

                  case 27:
                     $( "#alert" )
                        .fadeOut( 500, () => {

                        } );
                     break;

                  case 13:
                     $( "#alert" )
                        .fadeOut( 500, () => {

                        } );
                     break;

                  default:
                     return;

                  }

               }

            } );

         $( document )
            .keyup( ( key ) => {

               // test if released key coincides with the first pressed key
               if ( key.which == 37 || key.which == 38 || key.which == 39 || key.which == 40 ) {
                  pressedKey = 0;
               }

            } );

      },

      alertTextDisplay: ( stringArray ) => {
         $( "#speech-bubble" )
            .typed( {
               strings: stringArray,
               typeSpeed: 10,
               callback: () => {

               }
            } );
      },

      timer: ( timeStamp ) => {

         let player = images[ "naruto" ];

         if ( pressedKey || shouldAnimate ) {

            shouldAnimate = true;

            if ( !start ) {
               start = timeStamp;
            }

            let progress = timeStamp - start;

            if ( progress * 16 / 160 <= 16 ) {

               if ( progress % 100 <= 45 && spriteAnimate ) {
                  GameModule.getNextSpriteFrame( player );
                  spriteAnimate = false;
               }

               if ( progress % 100 >= 50 && !spriteAnimate ) {
                  spriteAnimate = true;
               }

               GameModule.moveSprite( player, Math.min( progress * 16 / 160, 16 ) );
               context.clearRect( 0, 0, canvas.width, canvas.height );
               GameModule.setSpriteFrame( player );

            } else {

               GameModule.moveSprite( player, 16 );

               playerX = 16 * parseInt( player.xPos / 16 );
               playerY = 16 * parseInt( player.yPos / 16 );

               start = null;
               shouldAnimate = false;

            }

         } else {
            start = null;
         }

         requestAnimationFrame( GameModule.timer )

      },

      getNextSpriteFrame: ( spriteObj ) => {

         if ( spriteObj.currentFrame < spriteObj.framesNumber - 1 ) {
            spriteObj.currentFrame += 1;
         } else {
            spriteObj.currentFrame = 0;
         }

      },

      setSpriteFrame: ( spriteObj ) => {

         let xPosImage = spriteObj.currentFrame * spriteObj.width;
         let yPosImage = spriteObj.orientation * spriteObj.height;

         GameModule.drawCanvasImageObj( spriteObj, xPosImage, yPosImage, context );

      },

      getObjCenterPos: ( obj ) => {

         return {
            xCenterPos: obj.xPos + obj.width / 2,
            yCenterPos: obj.yPos + obj.height / 2
         };

      },

      getDistanceBetweenObjects: ( obj1, obj2 ) => {

         let obj1Position = GameModule.getObjCenterPos( obj1 );
         let obj2Position = GameModule.getObjCenterPos( obj2 );

         return Math.hypot(
            ( obj1Position.xCenterPos - obj2Position.xCenterPos ),
            ( obj1Position.yCenterPos - obj2Position.yCenterPos )
         );
      },

      moveSprite: ( spriteObj, dist ) => {

         let player = images[ "naruto" ];

         dist = parseInt( dist );

         switch ( spriteObj.orientation ) {

         case 0:
            if ( GameModule.testForFreeSpaceInMap( player.xPos, playerY + 16, 32, 32 ) ) {
               spriteObj.yPos = playerY + dist;
            }
            break;

         case 1:
            if ( GameModule.testForFreeSpaceInMap( playerX - 16, player.yPos, 32, 32 ) ) {
               spriteObj.xPos = playerX - dist;
            }
            break;

         case 2:
            if ( GameModule.testForFreeSpaceInMap( playerX + 16, player.yPos, 32, 32 ) ) {
               spriteObj.xPos = playerX + dist;
            }
            break;

         case 3:
            if ( GameModule.testForFreeSpaceInMap( player.xPos, playerY - 16, 32, 32 ) ) {
               spriteObj.yPos = playerY - dist;
            }
            break;

         default:
            return;

         }

      },

      changeSpriteOrientation: ( spriteObj, orientation ) => {

         switch ( orientation ) {

         case "up":
            spriteObj.orientation = 3;
            break;

         case "down":
            spriteObj.orientation = 0;
            break;

         case "left":
            spriteObj.orientation = 1;
            break;

         case "right":
            spriteObj.orientation = 2;
            break;

         default:
            return;

         }

         GameModule.setSpriteFrame( spriteObj );

      },

      setRandomSpriteOption: ( obj, numberOfOptions ) => {

         let randomOption = Math.floor( Math.random() * ( numberOfOptions ) );

         obj.css( "background-position", `${( -randomOption ) * size}px 0` );

      },

      renderFrame: () => {

      },

      insertObjIntoMap: ( obj, xPos, yPos, objValue ) => {

         let {
            width,
            height
         } = GameModule.objSizeToBlockSize( obj );

         for ( let line = yPos; line < yPos + height; line++ ) {
            for ( let column = xPos; column < xPos + width; column++ ) {
               myMap.set( line, column, objValue );
            }
         }

         obj.mapPosX = xPos;
         obj.mapPosY = yPos;

         obj.css( {
            left: xPos * 16,
            top: yPos * 16
         } );

      },

      deleteObjFromMap: ( obj ) => {

         let {
            width,
            height
         } = GameModule.objSizeToBlockSize( obj );

         let xPos = $el.mapPosX;
         let yPos = $el.mapPosY;

         for ( let line = yPos; line < yPos + height; line++ ) {
            for ( let column = xPos; column < xPos + width; column++ ) {
               myMap.set( line, column, 0 );
            }
         }

      },

      objSizeToBlockSize: ( obj ) => {

         let width = $el.width() / 16;
         let height = $el.height() / 16;

         return {
            width,
            height
         };

      },

      levelDebugger: () => {

         return {

            showMap: () => {

               console.log( myMap );

            }

         };

      },

      arrayTo2DLevel: ( levelNumber ) => {

         let levelData = LevelModule.getLevel( levelNumber - 1 );

         for ( let boxNr = 0; boxNr < 1152; boxNr++ ) {
            myMap[ boxNr ] = levelData[ boxNr ];
         }

      },

      getNpcs: ( levelNumber ) => {

         npcs = LevelModule.getNpcs( levelNumber - 1 );

      },

      setLevelArrayPrototype: () => {

         Int8Array.prototype.get = function ( line, column ) {
            return this[ ( line * this.nrOfColumns ) + column ];
         };

         Int8Array.prototype.set = function ( line, column, value ) {
            this[ ( line * this.nrOfColumns ) + column ] = value;
            return this[ ( line * this.nrOfColumns ) + column ];
         };

         Int8Array.prototype.setNrOfColumns = function ( nrOfColumns ) {
            this.nrOfColumns = nrOfColumns;
         };

         myMap.setNrOfColumns( 48 );

      },

      testForPosInMapBoundaries: ( xPos, yPos ) => {

         if ( xPos >= 0 && yPos >= 0 && xPos < 48 * 16 && yPos < 24 * 16 ) {
            return true;
         }

         return false;

      },

      testForFreeSpaceInMap: ( xPos, yPos, height, width ) => {

         if ( !GameModule.testForPosInMapBoundaries( xPos, yPos ) ) {
            return false;
         }

         for ( let line = yPos / 16; line < ( yPos + height ) / 16; line++ ) {
            for ( let column = xPos / 16; column < ( xPos + width ) / 16; column++ ) {
               if ( myMap.get( line, column ) > 0 ) {
                  return false;
               }
            }
         }

         return true;

      },

      setCanvasImageObjPos: ( obj, xPos, yPos ) => {

         obj.xPos = xPos;
         obj.yPos = yPos;

      },

      setCanvasBackground: ( obj ) => {

         if ( obj.loaded == false ) {
            obj.image.addEventListener( "load", () => {
               backgroundContext.drawImage( obj.image, 0, 0, obj.width, obj.height, obj.xPos, obj.yPos, obj.width, obj.height );
            }, false );
            obj.loaded = true;
         } else {
            backgroundContext.drawImage( obj.image, 0, 0, obj.width, obj.height, obj.xPos, obj.yPos, obj.width, obj.height );
         }

      },

      setCanvasForeground: ( obj ) => {

         if ( obj.loaded == false ) {
            obj.image.addEventListener( "load", () => {
               foregroundContext.drawImage( obj.image, 0, 0, obj.width, obj.height, obj.xPos, obj.yPos, obj.width, obj.height );
            }, false );
            obj.loaded = true;
         } else {
            foregroundContext.drawImage( obj.image, 0, 0, obj.width, obj.height, obj.xPos, obj.yPos, obj.width, obj.height );
         }

      },

      addCanvasImageObj: ( name, imageUrl, objHeight, objWidth, frameTotal ) => {

         let image = new Image();
         image.src = imageUrl;

         let obj = {
            image,
            name,
            height: objHeight,
            width: objWidth,
            loaded: false,
            xPos: 0,
            yPos: 0
         };

         if ( frameTotal ) {
            obj.framesNumber = frameTotal;
            obj.currentFrame = 0;
            obj.orientation = 0;
         }

         images[ name ] = obj;

      },

      drawCanvasImageObj: ( obj, xPosImage, yPosImage, canvasContext ) => {

         // failure safety
         canvasContext.drawImage( obj.image, xPosImage, yPosImage, obj.width, obj.height, obj.xPos, obj.yPos, obj.width, obj.height );

         if ( obj.loaded == false ) {
            obj.image.addEventListener( "load", () => {
               canvasContext.drawImage( obj.image, xPosImage, yPosImage, obj.width, obj.height, obj.xPos, obj.yPos, obj.width, obj.height );
            }, false );
            obj.loaded = true;
         } else {
            canvasContext.drawImage( obj.image, xPosImage, yPosImage, obj.width, obj.height, obj.xPos, obj.yPos, obj.width, obj.height );
         }

      },

      moveSolidToDirection: () => {

      },

      resizeHandler: () => {

      },

      canvasMouseHandler: () => {

         let offset = $game.offset();

         $game.mousemove( ( mouse ) => {

               let mouseLeft = parseInt( ( mouse.pageX - offset.left ) / 16 );
               let mouseTop = parseInt( ( mouse.pageY - offset.top ) / 16 );

               if ( myMap.get( mouseTop, mouseLeft ) >= 2 ) {
                  $game.css( {
                     cursor: `url('img/game/cursors/pointing_hand.cur'), pointer`
                  } );
               } else {
                  $game.css( {
                     cursor: `url('img/game/cursors/left_ptr.cur'), default`
                  } );
               }

            } )
            .click( ( mouse ) => {

               let mouseLeft = parseInt( ( mouse.pageX - offset.left ) / 16 );
               let mouseTop = parseInt( ( mouse.pageY - offset.top ) / 16 );

               if ( myMap.get( mouseTop, mouseLeft ) >= 2 ) {
                  GameModule.gameAction( myMap.get( mouseTop, mouseLeft ) );
               }

            } );

      },

      miyazaki: () => {

         if ( GameModule.getDistanceBetweenObjects( images[ "miyazaki" ], images[ "naruto" ] ) < 48 ) {

            switch ( currentLevel ) {

            case 1:
               let stringArray = [ "This my test string", "I hope it works" ];
               GameModule.drawCanvasImageObj( images[ "miyazakiPortrait" ], 0, 0, portraitContext );
               $( "#alert" )
                  .fadeIn( 500, () => {
                     GameModule.alertTextDisplay( stringArray );
                  } );
               break;

            default:
               break;

            }

         }
      },

      gameAction: ( id ) => {

         let obj = npcs.filter( ( obj ) => {
            return obj.id === id;
         } )[ 0 ];

         switch ( obj.name ) {

         case "miyazaki":
            GameModule.miyazaki();
            break;

         default:
            break;

         }

      },

      moveToLevel: () => {

      },

   };
} )();

$( "#game" )
   .imagesLoaded( () => {
      GameModule.test();
   } );
