let currentMode = '2d';

        function setMode(mode) {
            currentMode = mode;
            document.getElementById('2d-button').classList.toggle('active', mode === '2d');
            document.getElementById('3d-button').classList.toggle('active', mode === '3d');
        }

        function drawGraph() {
            const input = document.getElementById('function-input').value;
            const graphDiv = document.getElementById('graph');
            graphDiv.innerHTML = '';

            if (currentMode === '2d') {
                draw2DGraph(input, graphDiv);
            } else {
                draw3DGraph(input, graphDiv);
            }
        }

        function draw2DGraph(input, graphDiv) {
            const canvas = document.createElement('canvas');
            canvas.width = graphDiv.clientWidth;
            canvas.height = graphDiv.clientHeight;
            graphDiv.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            // Koordinat sistemi çizimi
            ctx.strokeStyle = '#000000';
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.moveTo(0, canvas.height / 2);
            ctx.lineTo(canvas.width, canvas.height / 2);
            ctx.stroke();

            const expr = math.compile(input);
            ctx.strokeStyle = '#ff0000';
            ctx.beginPath();
            for (let x = -10; x <= 10; x += 0.1) {
                const y = expr.evaluate({ x: x });
                const canvasX = (x + 10) * (canvas.width / 20);
                const canvasY = canvas.height - ((y + 10) * (canvas.height / 20));
                if (x === -10) {
                    ctx.moveTo(canvasX, canvasY);
                } else {
                    ctx.lineTo(canvasX, canvasY);
                }
            }
            ctx.stroke();
        }

        function draw3DGraph(input, graphDiv) {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, graphDiv.clientWidth / graphDiv.clientHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(graphDiv.clientWidth, graphDiv.clientHeight);
            graphDiv.appendChild(renderer.domElement);

            // Koordinat sistemi çizimi
            const axesHelper = new THREE.AxesHelper(20);
            scene.add(axesHelper);

            const geometry = new THREE.BufferGeometry();
            const vertices = [];

            const expr = math.compile(input);
            for (let x = -10; x <= 10; x += 0.5) {
                for (let y = -10; y <= 10; y += 0.5) {
                    const z = expr.evaluate({ x: x, y: y });
                    vertices.push(x, y, z);
                }
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            const material = new THREE.PointsMaterial({ color: 0xff0000, size: 0.1 });
            const points = new THREE.Points(geometry, material);
            scene.add(points);

            // Eksenler için sayılar ekleme
            const addAxisLabels = (axis, size) => {
                const divisions = 10;
                for (let i = -size; i <= size; i += size / divisions) {
                    const label = document.createElement('div');
                    label.style.position = 'absolute';
                    label.style.color = 'black';
                    label.innerHTML = i.toString();
                    label.style.transform = `translate(-50%, -50%)`;
                    if (axis === 'x') {
                        label.style.left = `${(i + size) * (graphDiv.clientWidth / (2 * size))}px`;
                        label.style.bottom = '0px';
                    } else if (axis === 'y') {
                        label.style.left = '0px';
                        label.style.bottom = `${(i + size) * (graphDiv.clientHeight / (2 * size))}px`;
                    } else if (axis === 'z') {
                        label.style.left = `${(i + size) * (graphDiv.clientWidth / (2 * size))}px`;
                        label.style.bottom = `${(i + size) * (graphDiv.clientHeight / (2 * size))}px`;
                    }
                    graphDiv.appendChild(label);
                }
            };

            addAxisLabels('x', 10);
            addAxisLabels('y', 10);
            addAxisLabels('z', 10);

            camera.position.z = 50;

            function animate() {
                requestAnimationFrame(animate);
                points.rotation.x += 0.01;
                points.rotation.y += 0.01;
                renderer.render(scene, camera);
            }
            animate();
        }
