package com.blackgrapes.amrito.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.unit.dp
import com.blackgrapes.amrito.ui.theme.BookColors
import kotlinx.coroutines.launch
import kotlin.math.PI
import kotlin.math.max
import kotlin.math.min

@Composable
fun BookCover(
    modifier: Modifier = Modifier,
    onOpeningComplete: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current
    
    var isDragging by remember { mutableStateOf(false) }
    var dragProgress by remember { mutableStateOf(0f) }
    val animatedProgress by animateFloatAsState(
        targetValue = if (isDragging) dragProgress else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        finishedListener = { if (it >= 0.99f) onOpeningComplete() }
    )
    
    Surface(
        modifier = modifier.fillMaxSize(),
        color = BookColors.PageBackground
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp)
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { 
                            isDragging = true
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        },
                        onDragEnd = {
                            isDragging = false
                            if (dragProgress > 0.5f) {
                                coroutineScope.launch {
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                }
                            }
                        },
                        onDragCancel = { isDragging = false },
                        onDrag = { change, dragAmount ->
                            change.consume()
                            dragProgress = (dragProgress + dragAmount.x / size.width)
                                .coerceIn(0f, 1f)
                        }
                    )
                }
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxSize()
                    .align(Alignment.Center)
            ) {
                drawBookCover(animatedProgress)
            }
        }
    }
}

private fun DrawScope.drawBookCover(progress: Float) {
    val width = size.width
    val height = size.height
    
    // Draw the book spine shadow
    drawRect(
        brush = Brush.horizontalGradient(
            colors = listOf(
                BookColors.Shadow,
                Color.Transparent
            ),
            startX = 0f,
            endX = 20.dp.toPx()
        ),
        size = size
    )
    
    // Draw the main cover
    rotate(
        degrees = progress * 120f,
        pivot = Offset(0f, height / 2)
    ) {
        drawRect(
            color = BookColors.CoverPrimary,
            topLeft = Offset(0f, 0f),
            size = size
        )
        
        // Add cover texture
        drawRect(
            brush = Brush.verticalGradient(
                colors = listOf(
                    Color.White.copy(alpha = 0.1f),
                    Color.Transparent,
                    Color.Black.copy(alpha = 0.1f)
                )
            ),
            size = size
        )
        
        // Draw edge bevel
        val bevelWidth = 4.dp.toPx()
        drawRect(
            brush = Brush.horizontalGradient(
                colors = listOf(
                    BookColors.CoverSecondary,
                    BookColors.CoverPrimary
                ),
                startX = width - bevelWidth,
                endX = width
            ),
            topLeft = Offset(width - bevelWidth, 0f),
            size = androidx.compose.ui.geometry.Size(bevelWidth, height)
        )
    }
}