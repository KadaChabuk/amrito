package com.blackgrapes.amrito.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.blackgrapes.amrito.ui.theme.BookColors
import kotlinx.coroutines.launch
import kotlin.math.min

@Composable
fun BookCover(
    modifier: Modifier = Modifier,
    onOpeningComplete: () -> Unit
) {
    val density = LocalDensity.current
    val coroutineScope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current
    
    // Animation States
    var isDragging by remember { mutableStateOf(false) }
    var dragProgress by remember { mutableStateOf(0f) }
    var hasStartedAnimation by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        hasStartedAnimation = true
    }

    val animatedProgress by animateFloatAsState(
        targetValue = if (isDragging) dragProgress else (if (hasStartedAnimation) 1f else 0f),
        animationSpec = if (isDragging) snap() else spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        finishedListener = { if (it >= 0.99f) onOpeningComplete() }
    )

    BoxWithConstraints(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF1A0F0F)) // Dark background like web
    ) {
        val coverWidth = with(LocalDensity.current) { maxWidth.toPx() }
        val availableWidth = maxWidth
        
        // Background radial gradient
        Canvas(modifier = Modifier.fillMaxSize()) {
            drawRect(
                brush = Brush.radialGradient(
                    colors = listOf(
                        BookColors.CoverPrimary.copy(alpha = 0.4f),
                        Color.Transparent
                    ),
                    center = Offset(size.width / 2, size.height / 2),
                    radius = size.width
                )
            )
        }

        // The Book Cover
        Box(
            modifier = Modifier
                .fillMaxSize()
                // Apply padding for system bars to avoid overlap
                .windowInsetsPadding(WindowInsets.systemBars)
                .padding(if (availableWidth > 600.dp) 48.dp else 24.dp)
                .graphicsLayer {
                    rotationY = -animatedProgress * 120f
                    transformOrigin = TransformOrigin(0f, 0.5f)
                    cameraDistance = 12f * density.density
                }
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { 
                            isDragging = true
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        },
                        onDragEnd = {
                            isDragging = false
                            if (dragProgress > 0.4f) {
                                coroutineScope.launch {
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                    // Trigger open logic handled by animateFloatAsState -> 1f
                                }
                            } else {
                                dragProgress = 0f // Snap back
                            }
                        },
                        onDragCancel = { isDragging = false },
                        onDrag = { change, dragAmount ->
                            change.consume()
                            dragProgress = (dragProgress - dragAmount.x / coverWidth).coerceIn(0f, 1f)
                        }
                    )
                }
        ) {
            // Cover Visuals
            Surface(
                modifier = Modifier
                    .fillMaxSize()
                    .shadow(elevation = 10.dp, shape = RoundedCornerShape(topEnd = 4.dp, bottomEnd = 4.dp)),
                color = BookColors.CoverPrimary,
                shape = RoundedCornerShape(topEnd = 4.dp, bottomEnd = 4.dp)
            ) {
                // Gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(BookColors.CoverPrimary, BookColors.CoverSecondary),
                                start = Offset(0f, 0f),
                                end = Offset(Float.POSITIVE_INFINITY, Float.POSITIVE_INFINITY)
                            )
                        )
                ) {
                    // Inner Border
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(12.dp)
                            .border(1.dp, BookColors.Border, RoundedCornerShape(2.dp))
                    )
                    
                    // Main Content Column
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Title Area
                        Column(
                            modifier = Modifier.weight(1f),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "THE COLLECTION OF",
                                color = BookColors.Gold.copy(alpha = 0.7f),
                                fontSize = 10.sp,
                                letterSpacing = 3.sp,
                                fontWeight = FontWeight.Light
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            // Responsive Title using logic based on available width
                            val titleSize = if (availableWidth > 600.dp) 48.sp else 32.sp
                            Text(
                                text = "Sri Sri Thakur",
                                color = BookColors.Gold,
                                fontSize = titleSize,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center,
                                lineHeight = titleSize * 1.1
                            )
                             Text(
                                text = "Anukulchandra",
                                color = BookColors.Gold,
                                fontSize = titleSize,
                                fontFamily = FontFamily.Serif,
                                fontWeight = FontWeight.Bold,
                                textAlign = TextAlign.Center,
                                lineHeight = titleSize * 1.1
                            )
                        }

                        // Portrait Placeholder Frame
                        Box(
                            modifier = Modifier
                                .weight(1.2f)
                                .aspectRatio(0.75f)
                                .border(1.dp, BookColors.Border.copy(alpha = 0.5f))
                                .background(Color(0xFF151010))
                        ) {
                             // Placeholder for image
                             Canvas(modifier = Modifier.fillMaxSize()) {
                                 drawRect(
                                     brush = Brush.verticalGradient(
                                         colors = listOf(Color.Transparent, Color.Black.copy(alpha = 0.8f))
                                     )
                                 )
                             }
                        }
                        
                        // Bottom Hint
                        Box(
                            modifier = Modifier
                                .weight(0.5f)
                                .fillMaxWidth(),
                            contentAlignment = Alignment.BottomCenter
                        ) {
                             Text(
                                text = "TOUCH TO OPEN",
                                color = BookColors.Gold.copy(alpha = 0.3f),
                                fontSize = 10.sp,
                                letterSpacing = 4.sp
                            )
                        }
                    }
                }
            }
            
            // Spine Shadow on left edge
            Box(
                 modifier = Modifier
                    .align(Alignment.CenterStart)
                    .fillMaxHeight()
                    .width(16.dp)
                    .background(
                        Brush.horizontalGradient(
                            colors = listOf(Color.Black.copy(alpha = 0.4f), Color.Transparent)
                        )
                    )
            ) {
                 // Vertical Spine Text
                 Column(
                     modifier = Modifier
                         .align(Alignment.Center)
                         .graphicsLayer { rotationZ = 90f },
                     horizontalAlignment = Alignment.CenterHorizontally,
                     verticalArrangement = Arrangement.Center
                 ) {
                     Text(
                         text = "শৈশব কাহিনী",
                         color = BookColors.Gold.copy(alpha = 0.8f),
                         fontSize = 12.sp,
                         fontWeight = FontWeight.Bold,
                         letterSpacing = 2.sp,
                         maxLines = 1
                     )
                 }
            }
        }
    }
}
