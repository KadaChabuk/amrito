package com.blackgrapes.amrito.ui.render

import android.content.Context
import android.graphics.Bitmap
import androidx.compose.ui.unit.IntSize

interface PageRenderer {
    fun initializeRenderer(context: Context)
    fun setViewportSize(width: Int, height: Int)
    fun setPageTextures(leftPage: Bitmap?, rightPage: Bitmap?, nextPage: Bitmap?)
    fun updatePageCurl(touchX: Float, touchY: Float, progress: Float)
    fun renderFrame()
    fun release()
}

sealed interface RenderingCapability {
    object Full3D : RenderingCapability
    object Basic2D : RenderingCapability
    object Fallback : RenderingCapability
}

fun detectRenderingCapability(context: Context): RenderingCapability {
    // TODO: Implement capability detection based on device GPU and OpenGL ES support
    return RenderingCapability.Full3D
}

data class PageRenderState(
    val size: IntSize = IntSize(0, 0),
    val currentSpread: Pair<Bitmap?, Bitmap?> = Pair(null, null),
    val nextPage: Bitmap? = null,
    val curlProgress: Float = 0f,
    val touchPoint: Pair<Float, Float> = Pair(0f, 0f)
)