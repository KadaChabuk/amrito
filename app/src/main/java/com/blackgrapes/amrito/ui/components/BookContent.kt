package com.blackgrapes.amrito.ui.components

import android.graphics.Bitmap
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import com.blackgrapes.amrito.ui.render.basic.Basic2DPageRenderer
import com.blackgrapes.amrito.ui.theme.AmritoTheme
import com.blackgrapes.amrito.ui.util.renderComposableToBitmap
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun BookContent(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var pages by remember { mutableStateOf<List<String>>(emptyList()) }
    var currentPageIndex by remember { mutableStateOf(0) }
    val coroutineScope = rememberCoroutineScope()

    val renderer = remember { Basic2DPageRenderer() }
    var renderBitmap by remember { mutableStateOf<Bitmap?>(null) }

    var viewWidth by remember { mutableStateOf(0) }
    var viewHeight by remember { mutableStateOf(0) }

    DisposableEffect(Unit) {
        renderer.initializeRenderer(context)
        onDispose {
            renderer.release()
        }
    }

    LaunchedEffect(Unit) {
        val content = context.assets.open("demo_two_pages.txt").bufferedReader().use { it.readText() }
        pages = content.split("\n\n")
    }

    // This effect renders the composable pages to bitmaps when the size is known and pages are loaded
    LaunchedEffect(pages, currentPageIndex) {
        if (pages.isEmpty() || viewWidth == 0 || viewHeight == 0) return@LaunchedEffect

        coroutineScope.launch {
            val pageWidth = viewWidth / 2

            // We are rendering the composables in a background thread to avoid blocking the UI
            withContext(Dispatchers.Default) {
                val leftBitmap = if (currentPageIndex > 0) {
                    renderComposableToBitmap(context, pageWidth, viewHeight) {
                        AmritoTheme { BookPage(pageContent = pages[currentPageIndex - 1]) }
                    }
                } else null

                val rightBitmap = if (currentPageIndex < pages.size) {
                    renderComposableToBitmap(context, pageWidth, viewHeight) {
                        AmritoTheme { BookPage(pageContent = pages[currentPageIndex]) }
                    }
                } else null

                val nextBitmap = if (currentPageIndex + 1 < pages.size) {
                    renderComposableToBitmap(context, pageWidth, viewHeight) {
                        AmritoTheme { BookPage(pageContent = pages[currentPageIndex + 1]) }
                    }
                } else null

                renderer.setPageTextures(leftBitmap, rightBitmap, nextBitmap)
                renderer.updatePageCurl(viewWidth.toFloat(), 0f, 0f) // Initial render
                withContext(Dispatchers.Main) {
                    renderBitmap = renderer.getRenderedBitmap()
                }
            }
        }
    }

    Canvas(
        modifier = modifier
            .fillMaxSize()
            .onSizeChanged { size ->
                if (size.width == 0 || size.height == 0) return@onSizeChanged
                viewWidth = size.width
                viewHeight = size.height
                renderer.setViewportSize(size.width, size.height)
                // Trigger a re-render with the new size
                currentPageIndex = currentPageIndex.coerceAtLeast(0)
            }
            .pointerInput(pages.size) {
                detectDragGestures(
                    onDragStart = { },
                    onDragEnd = {
                        val currentWidth = renderBitmap?.width ?: viewWidth
                        if (currentWidth < viewWidth * 0.75f && currentPageIndex < pages.size - 2) {
                            currentPageIndex += 2 // Go to next spread
                        } else {
                            renderer.updatePageCurl(viewWidth.toFloat(), 0f, 0f)
                            renderBitmap = renderer.getRenderedBitmap()
                        }
                    },
                    onDrag = { change, _ ->
                        change.consume()
                        val touchX = change.position.x
                        val progress = (viewWidth - touchX) / (viewWidth / 2f)
                        renderer.updatePageCurl(touchX, change.position.y, progress.coerceIn(0f, 1f))
                        coroutineScope.launch(Dispatchers.Main) {
                            renderBitmap = renderer.getRenderedBitmap()
                        }
                    }
                )
            }
    ) {
        renderBitmap?.let {
            drawImage(it.asImageBitmap())
        }
    }
}