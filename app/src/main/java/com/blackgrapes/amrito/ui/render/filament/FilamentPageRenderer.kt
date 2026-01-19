package com.blackgrapes.amrito.ui.render.filament

import android.content.Context
import android.graphics.Bitmap
import com.blackgrapes.amrito.ui.render.PageRenderer
import com.google.android.filament.*
import com.google.android.filament.android.UiHelper
import java.nio.ByteBuffer
import kotlin.math.max

class FilamentPageRenderer : PageRenderer {
    private lateinit var engine: Engine
    private lateinit var renderer: Renderer
    private lateinit var scene: Scene
    private lateinit var view: View
    private lateinit var camera: Camera
    private lateinit var uiHelper: UiHelper
    
    private var swapChain: SwapChain? = null
    private var textureLeft: Texture? = null
    private var textureRight: Texture? = null
    private var textureNext: Texture? = null

    override fun initializeRenderer(context: Context) {
        engine = Engine.create()
        renderer = engine.createRenderer()
        scene = engine.createScene()
        view = engine.createView()
        camera = engine.createCamera(engine.entityManager.create())
        
        uiHelper = UiHelper(UiHelper.ContextErrorPolicy.DONT_CHECK)
        
        view.scene = scene
        view.camera = camera
        
        // Set up initial camera position
        camera.setProjection(45.0, 1.0, 0.1, 20.0, Camera.Fov.VERTICAL)
        camera.lookAt(
            0.0, 0.0, 4.0,  // Eye position
            0.0, 0.0, 0.0,  // Look at point
            0.0, 1.0, 0.0   // Up vector
        )
    }

    override fun setViewportSize(width: Int, height: Int) {
        val aspectRatio = width.toDouble() / max(height, 1)
        camera.setProjection(45.0, aspectRatio, 0.1, 20.0, Camera.Fov.VERTICAL)
        view.viewport = Viewport(0, 0, width, height)
    }

    override fun setPageTextures(leftPage: Bitmap?, rightPage: Bitmap?, nextPage: Bitmap?) {
        // Clean up previous textures
        textureLeft?.let { engine.destroyTexture(it) }
        textureRight?.let { engine.destroyTexture(it) }
        textureNext?.let { engine.destroyTexture(it) }
        
        // Create new textures from bitmaps
        leftPage?.let { bitmap ->
            textureLeft = createTextureFromBitmap(bitmap)
        }
        
        rightPage?.let { bitmap ->
            textureRight = createTextureFromBitmap(bitmap)
        }
        
        nextPage?.let { bitmap ->
            textureNext = createTextureFromBitmap(bitmap)
        }
    }

    override fun updatePageCurl(touchX: Float, touchY: Float, progress: Float) {
        // TODO: Update page curl mesh and animation based on touch position and progress
    }

    override fun renderFrame() {
        frameTimeNanos = System.nanoTime()
        // Render the scene
        if (renderer.beginFrame(swapChain!!, frameTimeNanos)) {
            renderer.render(view)
            renderer.endFrame()
        }
    }

    override fun release() {
        // Clean up resources
        textureLeft?.let { engine.destroyTexture(it) }
        textureRight?.let { engine.destroyTexture(it) }
        textureNext?.let { engine.destroyTexture(it) }
        
        engine.destroyRenderer(renderer)
        engine.destroyView(view)
        engine.destroyScene(scene)
        engine.destroyCameraComponent(camera.entity)
        engine.entityManager.destroy(camera.entity)
        
        engine.destroy()
    }
    
    private fun createTextureFromBitmap(bitmap: Bitmap): Texture {
        val texture = Texture.Builder()
            .width(bitmap.width)
            .height(bitmap.height)
            .levels(1)
            .sampler(Texture.Sampler.SAMPLER_2D)
            .format(Texture.InternalFormat.RGBA8)
            .build(engine)
            
        // Upload bitmap data to texture
        val buffer = ByteBuffer.allocate(bitmap.byteCount)
        bitmap.copyPixelsToBuffer(buffer)
        buffer.flip()
        
        val descriptor = Texture.PixelBufferDescriptor(
            buffer,
            Texture.Format.RGBA,
            Texture.Type.UBYTE
        )

        texture.setImage(engine, 0, descriptor)

        return texture
    }
    
    private var frameTimeNanos = System.nanoTime()
}