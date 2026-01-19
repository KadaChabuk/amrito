package com.blackgrapes.amrito.ui.render.basic

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Shader
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import com.blackgrapes.amrito.ui.render.PageRenderer
import com.blackgrapes.amrito.ui.theme.BookColors
import kotlin.math.max
import kotlin.math.pow
import kotlin.math.min

class Basic2DPageRenderer : PageRenderer {
    private var width: Int = 0
    private var height: Int = 0
    private var leftPage: Bitmap? = null
    private var rightPage: Bitmap? = null
    private var nextPage: Bitmap? = null
    private var renderBitmap: Bitmap? = null
    private var renderCanvas: Canvas? = null
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }
    private val backPagePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        // Simulate the darker look of a page's back
        color = 0x99000000.toInt()
        style = Paint.Style.FILL
    }
    
    override fun initializeRenderer(context: Context) {
        // Nothing specific needed for 2D rendering initialization
    }

    override fun setViewportSize(width: Int, height: Int) {
        this.width = width
        this.height = height
        
        renderBitmap?.recycle()
        renderBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        renderCanvas = Canvas(renderBitmap!!)
    }

    override fun setPageTextures(leftPage: Bitmap?, rightPage: Bitmap?, nextPage: Bitmap?) {
        this.leftPage = leftPage
        this.rightPage = rightPage
        this.nextPage = nextPage
    }

    override fun updatePageCurl(touchX: Float, touchY: Float, progress: Float) {
        renderBitmap?.let { bitmap ->
            renderCanvas?.let { canvas ->
                // Clear the canvas
                canvas.drawColor(Color.White.toArgb())

                // Draw the base pages
                leftPage?.let { page ->
                    canvas.drawBitmap(page, 0f, 0f, paint)
                }

                rightPage?.let { page ->
                    val right = width / 2f
                    canvas.drawBitmap(page, right, 0f, paint)
                }

                // Calculate curl effect
                val (curlPath, shadowPath, backPagePath) = createCurlPaths(touchX, progress)

                // Draw the back of the turning page (the next page's left side)
                canvas.drawPath(backPagePath, backPagePaint)

                // Draw the shadow with a gradient
                val shadowGradient = LinearGradient(
                    touchX - 50, 0f, touchX, 0f,
                    intArrayOf(Color.Transparent.toArgb(), BookColors.Shadow.toArgb(), Color.Transparent.toArgb()),
                    floatArrayOf(0f, 0.5f, 1f),
                    Shader.TileMode.CLAMP
                )
                shadowPaint.shader = shadowGradient
                canvas.drawPath(shadowPath, shadowPaint)

                // Draw the visible part of the next page (the curled part)
                nextPage?.let { page ->
                    // This is a simplified version. A true implementation would render the "back" of the right page.
                    // For now, we render the next page's content.
                    canvas.save()
                    canvas.clipPath(curlPath)
                    canvas.drawBitmap(page, width / 2f, 0f, paint)
                    canvas.restore()
                }
            }
        }
    }

    fun getRenderedBitmap(): Bitmap? {
        return renderBitmap
    }

    override fun renderFrame() {
        // Nothing to do here - the bitmap is already rendered
    }

    override fun release() {
        renderBitmap?.recycle()
        renderBitmap = null
        renderCanvas = null
        leftPage = null
        rightPage = null
        nextPage = null
    }
    
    private fun createCurlPaths(rawTouchX: Float, progress: Float): Triple<Path, Path, Path> {
        val pageWidth = width / 2f
        val pageHeight = height.toFloat()

        // The x-position of the fold line, moving from right to left
        val foldX = width - (pageWidth * progress)

        // The radius of the curl cylinder
        val curlRadius = 60f * (1 - progress.pow(0.5f))
        val controlPointX = foldX - curlRadius

        val curlPath = Path().apply {
            moveTo(foldX, 0f)
            quadTo(controlPointX, pageHeight / 2, foldX, pageHeight)
            lineTo(width.toFloat(), pageHeight)
            lineTo(width.toFloat(), 0f)
            close()
        }

        val shadowPath = Path().apply {
            moveTo(foldX, 0f)
            lineTo(foldX - 50, 0f) // Shadow width
            lineTo(foldX - 50, pageHeight)
            lineTo(foldX, pageHeight)
            close()
        }

        val backPagePath = Path().apply {
            moveTo(foldX, 0f)
            quadTo(controlPointX, pageHeight / 2, foldX, pageHeight)
            lineTo(pageWidth, pageHeight)
            lineTo(pageWidth, 0f)
            close()
        }

        return Triple(curlPath, shadowPath, backPagePath)
    }
}